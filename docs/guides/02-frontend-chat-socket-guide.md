# 📘 Guide d'Apprentissage & d'Intégration Frontend : Messagerie Temps Réel

Ce guide a été conçu pour t'apprendre en profondeur l'architecture et l'implémentation de la partie **temps réel (client-side)** pour le chat de `ft_transcendence`, en utilisant **Next.js 16 (App Router)**, **React 19**, **Socket.io Client**, et le gestionnaire d'état **Zustand**.

Grâce à ce guide, tu comprendras comment connecter la socket `/chat`, gérer la mise à jour instantanée de la liste des conversations, incrémenter les messages non lus, animer les indicateurs de frappe (*typing indicators*), et marquer les messages comme vus, tout en respectant les règles strictes de React 19 (aucune boucle de rendu, aucun `setState` synchrone dans un effet).

---

## 📑 Table des Matières
1. [Concepts Fondamentaux & Modèle Mental Frontend](#1-concepts-fondamentaux--modèle-mental-frontend)
   - [Le modèle hybride : REST au chargement + WebSockets pour les deltas](#le-modèle-hybride--rest-au-chargement--websockets-pour-les-deltas)
   - [Pourquoi Zustand plutôt que des useState ou Context éparpillés ?](#pourquoi-zustand-plutôt-que-des-usestate-ou-context-éparpillés-)
   - [Le cycle de vie du Socket Client et le Multiplexage (`/presence` & `/chat`)](#le-cycle-de-vie-du-socket-client-et-le-multiplexage-presence--chat)
2. [Architecture de Données : Le Store Zustand (`useChatStore`)](#2-architecture-de-données--le-store-zustand-usechatstore)
   - [Structure de l'état réactif](#structure-de-létat-réactif)
   - [La règle d'or de l'immuabilité : insérer et réordonner](#la-règle-dor-de-limmuabilité--insérer-et-réordonner)
   - [Gestion atomique des compteurs de non-lus](#gestion-atomique-des-compteurs-de-non-lus)
3. [Les Événements Temps Réel du Namespace `/chat`](#3-les-événements-temps-réel-du-namespace-chat)
   - [Tableau récapitulatif des événements](#tableau-récapitulatif-des-événements)
   - [Réception d'un message (`new_message`)](#réception-dun-message-new_message)
   - [Indicateur de saisie (`user_typing`)](#indicateur-de-saisie-user_typing)
   - [Accusé de lecture (`message_seen`)](#accusé-de-lecture-message_seen)
4. [Implémentation Pas à Pas (Code & Explications)](#4-implémentation-pas-à-pas-code--explications)
   - [Étape 1 : Le Store Global (`srcs/frontend/stores/use-chat-store.ts`)](#étape-1--le-store-global-use-chat-storets)
   - [Étape 2 : Le Hook d'Initialisation et de Souscription (`use-chat-socket.ts`)](#étape-2--le-hook-dinitialisation-et-de-souscription-use-chat-socketts)
   - [Étape 3 : Initialisation Globale dans le Layout Authentifié](#étape-3--initialisation-globale-dans-le-layout-authentifié)
   - [Étape 4 : Connexion de la Liste des Conversations (`ChatListClient.tsx`)](#étape-4--connexion-de-la-liste-des-conversations-chatlistclienttsx)
   - [Étape 5 : Connexion de la Vue de Discussion Active (`ConversationClient.tsx`)](#étape-5--connexion-de-la-vue-de-discussion-active-conversationclienttsx)
   - [Étape 6 : Ajout du Badge Global de Non-Lus dans la Navigation](#étape-6--ajout-du-badge-global-de-non-lus-dans-la-navigation)
5. [Bonnes Pratiques React 19 & Next.js 16](#5-bonnes-pratiques-react-19--nextjs-16)
   - [Éviter l'erreur `Calling setState synchronously within an effect`](#éviter-lerreur-calling-setstate-synchronously-within-an-effect)
   - [Déduplication des messages (Idempotence)](#déduplication-des-messages-idempotence)
   - [Nettoyage rigoureux des écouteurs (`socket.off`)](#nettoyage-rigoureux-des-écouteurs-socketoff)
6. [Protocole de Test & Vérification Pas à Pas](#6-protocole-de-test--vérification-pas-à-pas)

---

## 1. Concepts Fondamentaux & Modèle Mental Frontend

### Le modèle hybride : REST au chargement + WebSockets pour les deltas

L'erreur la plus courante dans les architectures temps réel est de vouloir faire transiter 100% des données par WebSocket, ou à l'inverse de faire du *polling* HTTP toutes les 3 secondes.

L'approche professionnelle adoptée par des applications comme Slack, Discord ou WhatsApp est le **modèle hybride** :
1. **Initialisation (HTTP REST)** :
   - Au chargement d'une page (`/chat` ou `/chat/[id]`), le client fait une requête HTTP GET classique (`/nest/chat/conversations` ou `/nest/chat/conversations/:id/messages`).
   - Cela garantit un chargement rapide, prévisible, facilement paginable par curseur, et compatible avec le rendu serveur (*SSR* ou hydratation cliente fluide).
2. **Temps réel réactif (WebSockets)** :
   - Dès que le socket est connecté, le client ne redemande plus jamais la liste entière !
   - Le serveur envoie uniquement les **deltas** (les petits événements : un nouveau message, une personne qui écrit, un message lu).
   - Le client met à jour son état local en mémoire instantanément.

```
Au chargement de la page :
Client ──── GET /chat/conversations ───► Serveur
Client ◄─── [ Liste de 10 convs ] ───── Serveur (Affichage immédiat)

Ensuite en continu (WebSocket) :
Serveur ─── Event: "new_message" ──────► Client
Client  ─── [ Met à jour conv #3, incrémente badge, déplace #3 en haut ]
```

---

### Pourquoi Zustand plutôt que des useState ou Context éparpillés ?

Dans une application Next.js comportant une Navbar, une barre latérale, une page `/chat` et des pages de conversation `/chat/[id]` :
- Si l'état des messages est enfermé dans un `useState` au sein de `ChatListClient`, la Navbar ne peut pas savoir qu'un nouveau message est arrivé pour afficher la pastille rouge `(1)`.
- Si l'utilisateur est sur la page `/feed` ou `/profile`, un `useState` situé dans la page `/chat` est **démonté** et ne recevra jamais l'événement !
- `React Context` impose de réexécuter le rendu de tout l'arbre de composants enveloppé dès qu'un champ change, ce qui est lourd pour un flux de messages fréquent.

**Zustand résout tous ces problèmes :**
1. **Store global en dehors de l'arbre React** : Accessible depuis n'importe où (Navbar, Modal, Page, Hook).
2. **Sélecteurs atomiques fins** : Un composant qui n'écoute que `totalUnreadCount` ne se re-rend **pas** quand un message arrive dans une conversation s'il a déjà été lu.
3. **Pas de `Provider` complexe** : Fonctionne directement avec React 19 sans boilerplate.

---

### Le cycle de vie du Socket Client et le Multiplexage (`/presence` & `/chat`)

Dans notre projet `ft_transcendence`, le fichier `srcs/frontend/lib/socket/socket-client.ts` fournit un singleton `getNamespaceSocket(namespace)`.

Pour le chat :
```typescript
const chatSocket = getNamespaceSocket("/chat");
```

- Le socket `/chat` utilise le **multiplexage Socket.io** : il emprunte la **même connexion réseau physique** que `/presence`, mais dispose de ses propres gestionnaires d'événements isolés.
- Les cookies de session Better Auth (`better-auth.session_token`) sont transmis automatiquement lors du handshake HTTP initial grâce à `withCredentials: true`.

---

## 2. Architecture de Données : Le Store Zustand (`useChatStore`)

### Structure de l'état réactif

L'état doit représenter fidèlement l'ensemble des besoins de l'interface :
```typescript
interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  messageTableId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isSeen: boolean;
  seenAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}
```

---

### La règle d'or de l'immuabilité : insérer et réordonner

Lorsqu'un message arrive pour une conversation $C$ :
1. La conversation $C$ doit voir son champ `lastMessage` mis à jour.
2. Sa date `updatedAt` passe à l'instant présent.
3. **Elle doit remonter tout en haut de la liste !** (Comme sur WhatsApp ou Messenger).
4. Si la conversation n'était pas encore dans la liste (ex: un utilisateur inconnu nous envoie son 1er message), elle est ajoutée au début du tableau.

En Zustand / JavaScript immuable :
```typescript
const updatedConversations = [
  // 1. La conversation mise à jour passe en premier
  updatedConv,
  // 2. Toutes les autres conversations sauf l'ancienne version de celle-ci
  ...existingConversations.filter(c => c.id !== convId)
];
```

---

### Gestion atomique des compteurs de non-lus

Comment savoir s'il faut incrémenter le badge non-lu d'une conversation ?
- Si l'utilisateur est **actuellement dans la conversation** (`activeConversationId === message.messageTableId`) :
  $\rightarrow$ **Pas d'incrémentation** de non-lu, car l'utilisateur a le chat sous les yeux ! On envoie immédiatement l'accusé de lecture (`mark_as_seen`).
- Si l'utilisateur est ailleurs (sur `/chat` mais dans une autre conversation, ou sur `/feed`, `/settings`) :
  $\rightarrow$ On incrémente le `unreadCount` de la conversation de $+1$.
  $\rightarrow$ On incrémente le `totalUnreadCount` global de $+1$.

---

## 3. Les Événements Temps Réel du Namespace `/chat`

### Tableau récapitulatif des événements

| Événement | Direction | Payload | Rôle |
| :--- | :---: | :--- | :--- |
| `join_conversation` | Client $\rightarrow$ Serveur | `{ conversationId: string }` | Rejoint la room Socket.io de la conversation active. |
| `leave_conversation` | Client $\rightarrow$ Serveur | `{ conversationId: string }` | Quitte la room de la conversation lors du démontage de la page. |
| `send_message` | Client $\rightarrow$ Serveur | `SendMessageDto` | Envoie un nouveau message via WebSocket. |
| `new_message` | Serveur $\rightarrow$ Client | `Message` | Notifie l'arrivée d'un nouveau message (reçu par le destinataire et l'émetteur). |
| `typing_start` | Client $\rightarrow$ Serveur | `{ conversationId, receiverId }` | Indique que l'utilisateur commence à écrire. |
| `typing_stop` | Client $\rightarrow$ Serveur | `{ conversationId, receiverId }` | Indique que l'utilisateur a arrêté d'écrire. |
| `user_typing` | Serveur $\rightarrow$ Client | `{ conversationId, userId, isTyping }` | Diffuse l'état de frappe à l'interlocuteur. |
| `mark_as_seen` | Client $\rightarrow$ Serveur | `{ conversationId: string }` | Demande de marquer les messages reçus comme vus. |
| `message_seen` | Serveur $\rightarrow$ Client | `{ conversationId, seenByUserId, seenAt }` | Notifie que l'interlocuteur a lu les messages. |

---

## 4. Implémentation Pas à Pas (Code & Explications)

### Étape 1 : Le Store Global (`srcs/frontend/stores/use-chat-store.ts`)

Crée le fichier `srcs/frontend/stores/use-chat-store.ts` :

```typescript
import { create } from "zustand";
import { getNamespaceSocket } from "@/lib/socket/socket-client";

export interface Participant {
  id: string;
  name: string;
  image: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: Participant | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  messageTableId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isSeen: boolean;
  seenAt: string | null;
  createdAt: string;
  sender: Participant;
}

interface ChatState {
  // Liste des conversations de l'utilisateur
  conversations: Conversation[];
  // ID de la conversation actuellement ouverte à l'écran (ou null si sur /chat ou ailleurs)
  activeConversationId: string | null;
  // Messages de la conversation active
  activeMessages: Message[];
  // Utilisateurs en train d'écrire : Map<conversationId, userId[]>
  typingUsers: Record<string, string[]>;
  // Indique si le socket chat est connecté
  isConnected: boolean;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  setActiveMessages: (messages: Message[]) => void;
  addActiveMessage: (message: Message) => void;
  
  // Gestionnaires d'événements WebSocket
  handleNewMessage: (message: Message, currentUserId: string) => void;
  handleUserTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  handleMessageSeen: (conversationId: string, seenByUserId: string, seenAt: string) => void;

  // Calcul du total des messages non lus
  getTotalUnreadCount: () => number;

  // Réinitialisation (ex: à la déconnexion)
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  activeMessages: [],
  typingUsers: {},
  isConnected: false,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversationId: (id) =>
    set((state) => {
      // Si on ouvre une conversation, on remet son compteur de non-lus local à 0
      if (id) {
        const updated = state.conversations.map((c) =>
          c.id === id ? { ...c, unreadCount: 0 } : c
        );
        return { activeConversationId: id, conversations: updated };
      }
      return { activeConversationId: id };
    }),

  setActiveMessages: (messages) => set({ activeMessages: messages }),

  addActiveMessage: (message) =>
    set((state) => {
      // Déduplication par ID pour éviter tout doublon
      if (state.activeMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return { activeMessages: [...state.activeMessages, message] };
    }),

  handleNewMessage: (message: Message, currentUserId: string) => {
    set((state) => {
      const convId = message.messageTableId;
      const isCurrentConvActive = state.activeConversationId === convId;
      const isSentByMe = message.senderId === currentUserId;

      // 1. Mise à jour des messages de la conversation active si ouverte
      let nextActiveMessages = state.activeMessages;
      if (isCurrentConvActive) {
        if (!state.activeMessages.some((m) => m.id === message.id)) {
          nextActiveMessages = [...state.activeMessages, message];
        }
      }

      // 2. Recherche de la conversation dans la liste existante
      const existingIndex = state.conversations.findIndex((c) => c.id === convId);
      let updatedConv: Conversation;

      if (existingIndex !== -1) {
        const current = state.conversations[existingIndex];
        updatedConv = {
          ...current,
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
          },
          updatedAt: message.createdAt,
          // N'incrémente le non-lu que si on est le destinataire et qu'on n'est pas sur cette conversation
          unreadCount:
            !isSentByMe && !isCurrentConvActive
              ? current.unreadCount + 1
              : current.unreadCount,
        };
      } else {
        // Nouvelle conversation : le participant est soit l'expéditeur soit le destinataire
        const otherUser = isSentByMe ? null : message.sender;
        updatedConv = {
          id: convId,
          participant: otherUser,
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
          },
          unreadCount: !isSentByMe && !isCurrentConvActive ? 1 : 0,
          updatedAt: message.createdAt,
        };
      }

      // 3. Réorganisation : la conversation mise à jour remonte tout en haut !
      const remainingConvs = state.conversations.filter((c) => c.id !== convId);
      const nextConversations = [updatedConv, ...remainingConvs];

      return {
        activeMessages: nextActiveMessages,
        conversations: nextConversations,
      };
    });
  },

  handleUserTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const currentList = state.typingUsers[conversationId] || [];
      let nextList: string[];

      if (isTyping) {
        nextList = currentList.includes(userId) ? currentList : [...currentList, userId];
      } else {
        nextList = currentList.filter((id) => id !== userId);
      }

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: nextList,
        },
      };
    });
  },

  handleMessageSeen: (conversationId, seenByUserId, seenAt) => {
    set((state) => {
      // Si la conversation active est concernée, on passe les messages émis par nous à isSeen = true
      if (state.activeConversationId === conversationId) {
        const nextActiveMessages = state.activeMessages.map((m) => {
          if (m.receiverId === seenByUserId && !m.isSeen) {
            return { ...m, isSeen: true, seenAt };
          }
          return m;
        });
        return { activeMessages: nextActiveMessages };
      }
      return state;
    });
  },

  getTotalUnreadCount: () => {
    return get().conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  },

  reset: () =>
    set({
      conversations: [],
      activeConversationId: null,
      activeMessages: [],
      typingUsers: {},
      isConnected: false,
    }),
}));
```

---

### Étape 2 : Le Hook d'Initialisation et de Souscription (`use-chat-socket.ts`)

Crée le fichier `srcs/frontend/hooks/use-chat-socket.ts` :

```typescript
"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth/use-session";
import { getNamespaceSocket } from "@/lib/socket/socket-client";
import { useChatStore, Message } from "@/stores/use-chat-store";

/**
 * Hook d'initialisation de la socket /chat.
 * Doit être appelé une seule fois dans le Layout privé racine.
 */
export function useChatSocketInit() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const handleNewMessage = useChatStore((s) => s.handleNewMessage);
  const handleUserTyping = useChatStore((s) => s.handleUserTyping);
  const handleMessageSeen = useChatStore((s) => s.handleMessageSeen);
  const reset = useChatStore((s) => s.reset);

  useEffect(() => {
    if (!userId) return;

    const socket = getNamespaceSocket("/chat");

    const onConnect = () => {
      useChatStore.setState({ isConnected: true });
    };

    const onDisconnect = () => {
      useChatStore.setState({ isConnected: false });
    };

    const onNewMessage = (message: Message) => {
      handleNewMessage(message, userId);
    };

    const onUserTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data?.conversationId && data?.userId) {
        handleUserTyping(data.conversationId, data.userId, data.isTyping);
      }
    };

    const onMessageSeen = (data: { conversationId: string; seenByUserId: string; seenAt: string }) => {
      if (data?.conversationId && data?.seenByUserId) {
        handleMessageSeen(data.conversationId, data.seenByUserId, data.seenAt);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("message_seen", onMessageSeen);

    if (!socket.connected) {
      socket.connect();
    } else {
      useChatStore.setState({ isConnected: true });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("message_seen", onMessageSeen);
      socket.disconnect();
      reset();
    };
  }, [userId, handleNewMessage, handleUserTyping, handleMessageSeen, reset]);
}

/**
 * Hook utilitaire pour interagir avec une conversation spécifique.
 * Gère l'entrée (join) et la sortie (leave) de la room, ainsi que la frappe et le vu.
 */
export function useConversationSocket(conversationId: string, receiverId?: string) {
  const socket = getNamespaceSocket("/chat");

  // Rejoindre la room de la conversation
  useEffect(() => {
    if (!conversationId) return;

    if (socket.connected) {
      socket.emit("join_conversation", { conversationId });
    } else {
      socket.once("connect", () => {
        socket.emit("join_conversation", { conversationId });
      });
    }

    return () => {
      if (socket.connected) {
        socket.emit("leave_conversation", { conversationId });
      }
    };
  }, [socket, conversationId]);

  // Émettre le début de frappe
  const sendTypingStart = useCallback(() => {
    if (!receiverId || !socket.connected) return;
    socket.emit("typing_start", { conversationId, receiverId });
  }, [socket, conversationId, receiverId]);

  // Émettre la fin de frappe
  const sendTypingStop = useCallback(() => {
    if (!receiverId || !socket.connected) return;
    socket.emit("typing_stop", { conversationId, receiverId });
  }, [socket, conversationId, receiverId]);

  // Marquer comme vu via WebSocket
  const sendMarkAsSeen = useCallback(() => {
    if (!socket.connected) return;
    socket.emit("mark_as_seen", { conversationId });
  }, [socket, conversationId]);

  return {
    sendTypingStart,
    sendTypingStop,
    sendMarkAsSeen,
  };
}
```

---

### Étape 3 : Initialisation Globale dans le Layout Authentifié

Dans `srcs/frontend/app/[locale]/(private)/layout.tsx` (ou dans un wrapper client dédié comme `PrivateLayoutClient.tsx`) :

```tsx
import { usePresenceInit } from "@/hooks/use-presence";
import { useChatSocketInit } from "@/hooks/use-chat-socket";

export function PrivateLayoutClient({ children }: { children: React.ReactNode }) {
  // 1. Initialise la présence (/presence)
  usePresenceInit();

  // 2. Initialise le chat temps réel (/chat)
  useChatSocketInit();

  return <>{children}</>;
}
```

Grâce à cela, **dès qu'un utilisateur est connecté**, il écoute en arrière-plan les nouveaux messages et les accusés de lecture sur tous ses onglets, même s'il est sur la page d'accueil `/feed` ou sur son profil !

---

### Étape 4 : Connexion de la Liste des Conversations (`ChatListClient.tsx`)

Dans `srcs/frontend/app/[locale]/(private)/chat/ChatListClient.tsx` :

Au lieu d'utiliser un `useState` local déconnecté du reste du monde, on charge les conversations depuis le backend au montage, puis on les injecte dans `useChatStore`. Ensuite, toute arrivée d'un événement `new_message` met à jour la liste et réordonne automatiquement !

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePresence } from "@/hooks/use-presence";
import { useChatStore } from "@/stores/use-chat-store";
import { Loader2, MessageSquare } from "@/components/icons";

export function ChatListClient() {
  const t = useTranslations("Chat");
  const tNav = useTranslations("Nav");
  const { checkIsOnline } = usePresence();

  // On consomme la liste réactive depuis Zustand !
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const [loading, setLoading] = useState(conversations.length === 0);

  useEffect(() => {
    let cancelled = false;

    async function fetchConversations() {
      try {
        const res = await fetch("/nest/chat/conversations", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) {
            // Stocke dans Zustand : les événements WebSocket mettront à jour ce tableau directement !
            setConversations(data);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchConversations();

    return () => {
      cancelled = true;
    };
  }, [setConversations]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* En-tête et bouton "Nouveau message" */}
      {/* ... affichage des conversations depuis `conversations` avec unreadCount et lastMessage ... */}
    </div>
  );
}
```

---

### Étape 5 : Connexion de la Vue de Discussion Active (`ConversationClient.tsx`)

Dans `srcs/frontend/app/[locale]/(private)/chat/[id]/ConversationClient.tsx` :

Points clés à connecter :
1. Définir `setActiveConversationId(conversationId)` au montage, et `setActiveConversationId(null)` au démontage.
2. Utiliser `useConversationSocket(conversationId, otherUser?.id)` pour rejoindre le salon.
3. Afficher les messages depuis `useChatStore((s) => s.activeMessages)`.
4. Envoyer `sendTypingStart()` dès que l'utilisateur tape du texte, avec un *debounce* (ex: 2 secondes d'inactivité) pour envoyer `sendTypingStop()`.
5. Afficher la mention discrète `Alice est en train d'écrire...` si `typingUsers[conversationId]` contient l'interlocuteur !

Exemple d'implémentation de la frappe avec debounce :

```typescript
const [inputValue, setInputValue] = useState("");
const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setInputValue(e.target.value);

  // Émission typing_start
  sendTypingStart();

  // Réinitialisation du minuteur de typing_stop
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    sendTypingStop();
  }, 2000);
};
```

---

### Étape 6 : Ajout du Badge Global de Non-Lus dans la Navigation

Dans ta Navbar ou barre latérale (`Navbar.tsx` ou `Sidebar.tsx`) :

```tsx
import { useChatStore } from "@/stores/use-chat-store";

export function ChatNavIcon() {
  // Sélectionne le total de messages non lus
  const unreadCount = useChatStore((state) => state.getTotalUnreadCount());

  return (
    <Link href="/chat" className="relative">
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
```

---

## 5. Bonnes Pratiques React 19 & Next.js 16

### Éviter l'erreur `Calling setState synchronously within an effect`

React 19 lève une erreur stricte lorsque `setState` est appelé immédiatement dans le corps d'un `useEffect` lors du premier rendu.

❌ **À proscrire :**
```typescript
useEffect(() => {
  if (isOpen) {
    setContent(""); // ❌ Erreur React 19 : déclenche un rendu en cascade
  }
}, [isOpen]);
```

✅ **La bonne pratique :**
Réinitialiser l'état dans les fonctions de rappel d'action utilisateur (*event handlers*), par exemple au moment de cliquer sur « Fermer » ou « Envoyer » :
```typescript
const handleClose = () => {
  setContent(""); // ✅ Déclenché par une action utilisateur, aucun avertissement
  onClose();
};
```

---

### Déduplication des messages (Idempotence)

Quand une application gère à la fois de l'optimisme d'UI et des reconnexions réseau, il arrive qu'un message soit émis deux fois ou re-diffusé.

Vérifie toujours la présence de l'`id` avant d'ajouter :
```typescript
addActiveMessage: (message) =>
  set((state) => {
    if (state.activeMessages.some((m) => m.id === message.id)) {
      return state; // Déjà présent, on ignore
    }
    return { activeMessages: [...state.activeMessages, message] };
  }),
```

---

### Nettoyage rigoureux des écouteurs (`socket.off`)

Si tu oublies de nettoyer un écouteur dans la fonction de retour d'un `useEffect` :
- Chaque fois que l'utilisateur navigue entre `/chat` et `/profile`, un nouvel écouteur s'ajoute.
- Après 5 allers-retours, un nouveau message déclenchera 5 fois la mise à jour !
- Utilise **toujours** la fonction de nettoyage pour appeler `socket.off("event_name", handler)`.

---

## 6. Protocole de Test & Vérification Pas à Pas

Pour valider l'expérience temps réel, teste avec **deux comptes utilisateurs différents** sur deux navigateurs distincts :
1. **Navigateur 1 (Alice)** : Connecté en mode normal sur `http://localhost:3000`.
2. **Navigateur 2 (Bob)** : Connecté en fenêtre privée ou sur un autre navigateur.

### Scénarios à vérifier :

1. **Test d'envoi instantané** :
   - Alice et Bob ouvrent leur conversation commune `/chat/[id]`.
   - Alice tape `Bonjour Bob !` et appuie sur Entrée.
   - **Résultat attendu** : Le message apparaît sous 20ms sur l'écran de Bob, et l'écran défile automatiquement vers le bas.
2. **Test de la liste des conversations** :
   - Bob se trouve sur la page `/chat` (la liste de ses conversations).
   - Alice lui envoie `Tu es là ?`.
   - **Résultat attendu** : La conversation d'Alice remonte immédiatement tout en haut de la liste de Bob, le dernier message affiche `Tu es là ?`, et la pastille violette affiche `1` non lu.
3. **Test du badge global en dehors du chat** :
   - Bob navigue vers `/feed` ou `/settings`.
   - Alice lui envoie un second message.
   - **Résultat attendu** : L'icône de messagerie dans la barre de navigation de Bob affiche un badge `(2)`.
4. **Test de l'indicateur de frappe** :
   - Alice commence à écrire dans le champ texte sans envoyer.
   - **Résultat attendu** : Une mention `Alice est en train d'écrire...` apparaît au-dessus du champ texte chez Bob, puis disparaît 2 secondes après qu'Alice a arrêté de taper.
5. **Test des accusés de lecture** :
   - Bob ouvre la conversation avec Alice.
   - **Résultat attendu** : Le badge de non-lu repasse à 0, et chez Alice, le message passe en statut « Vu ».
