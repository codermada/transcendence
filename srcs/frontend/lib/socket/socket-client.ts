import { io, Socket } from "socket.io-client";

/**
 * Returns the base URL for backend WebSocket connections.
 */
export const getSocketBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    const wsProto = protocol === "https:" ? "https:" : "http:";
    return `${wsProto}//${hostname}:3000`;
  }
  return "http://localhost:3000";
};

// Global cache of Socket.io client instances keyed by namespace
const socketsCache = new Map<string, Socket>();

/**
 * Factory to get or create a managed Socket.io client instance for a given namespace.
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
    withCredentials: true,
    autoConnect: false, // Explicit connection managed by providers/hooks
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socketsCache.set(normalizedNamespace, socket);
  return socket;
}
