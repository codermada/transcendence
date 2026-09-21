import { io, Socket } from "socket.io-client";

/**
 * Returns the base URL for backend WebSocket connections.
 */
export const getSocketBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://localhost:9000";
};

// Global cache of Socket.io client instances keyed by namespace
const socketsCache = new Map<string, Socket>();

/**
 * Factory to get or create a managed Socket.io client instance for a given namespace.
 * Configured for Docker with Nginx reverse proxy (/nest/socket.io).
 *
 * @param namespace - WebSocket namespace (e.g., "/presence", "/chat")
 * @returns Configured Socket instance
 */
export function getNamespaceSocket(namespace: string): Socket {
  const normalizedNamespace = namespace.startsWith("/") ? namespace : `/${namespace}`;

  if (socketsCache.has(normalizedNamespace)) {
    return socketsCache.get(normalizedNamespace)!;
  }

  const baseUrl = getSocketBaseUrl();
  const socketUrl = `${baseUrl}${normalizedNamespace}`;

  const socket = io(socketUrl, {
    path: "/nest/socket.io",
    withCredentials: true,
    autoConnect: false, // Explicit connection managed by providers/hooks
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socketsCache.set(normalizedNamespace, socket);
  return socket;
}
