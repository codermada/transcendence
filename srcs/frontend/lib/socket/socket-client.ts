import { io, Socket } from "socket.io-client";

const SOCKETS_CACHE = new Map<string, Socket>();

export const getSocketBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return `https://${process.env.NEXT_PUBLIC_IP_ADDRESS ? process.env.NEXT_PUBLIC_IP_ADDRESS : 'localhost' }:9000`
};

export function getNamespaceSocket(namespace: string): Socket {
  const normalizedNamespace = namespace.startsWith("/") ? namespace : `/${namespace}`;

  if (SOCKETS_CACHE.has(normalizedNamespace)) {
    return SOCKETS_CACHE.get(normalizedNamespace)!;
  }

  const baseUrl = getSocketBaseUrl();
  const socketUrl = `${baseUrl}${normalizedNamespace}`;

  const socket = io(socketUrl, {
    path: "/nest/socket.io",
    withCredentials: true,
    autoConnect: false,
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  SOCKETS_CACHE.set(normalizedNamespace, socket);
  return socket;
}
