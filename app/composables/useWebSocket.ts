type WSEventType =
  | "booking_confirmed"
  | "booking_rejected"
  | "new_review"
  | "new_member"
  | "weather_alert"
  | "route_update"
  | "notification";

interface WSEvent {
  type: WSEventType;
  data: Record<string, unknown>;
  timestamp: number;
}

type WSHandler = (event: WSEvent) => void;

export function useWebSocket() {
  const config = useRuntimeConfig();
  const baseUrl = (config.public.apiBase as string).replace(/^http/, "ws");
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);

  let socket: WebSocket | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const handlers = new Map<WSEventType | "*", Set<WSHandler>>();

  const MAX_RECONNECT = 5;
  const RECONNECT_DELAY = 3000;
  const HEARTBEAT_INTERVAL = 30_000;

  function on(event: WSEventType | "*", handler: WSHandler) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
  }

  function off(event: WSEventType | "*", handler: WSHandler) {
    handlers.get(event)?.delete(handler);
  }

  function emit(wsEvent: WSEvent) {
    handlers.get(wsEvent.type)?.forEach((h) => h(wsEvent));
    handlers.get("*")?.forEach((h) => h(wsEvent));
  }

  function connect(channel: string = "notifications") {
    if (import.meta.server) return;

    const token = localStorage.getItem("access_token");
    const wsUrl = `${baseUrl}/ws/v1/${channel}${token ? `?token=${token}` : ""}`;

    try {
      socket = new WebSocket(wsUrl);
    } catch {
      scheduleReconnect(channel);
      return;
    }

    socket.onopen = () => {
      isConnected.value = true;
      reconnectAttempts.value = 0;
      startHeartbeat();
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WSEvent;
        if (parsed.type) emit(parsed);
      } catch {
        // Ignore invalid JSON
      }
    };

    socket.onclose = () => {
      isConnected.value = false;
      stopHeartbeat();
      scheduleReconnect(channel);
    };

    socket.onerror = () => {
      socket?.close();
    };
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    reconnectAttempts.value = MAX_RECONNECT; // prevent reconnect
    stopHeartbeat();
    socket?.close();
    socket = null;
    isConnected.value = false;
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  function scheduleReconnect(channel: string) {
    if (reconnectAttempts.value >= MAX_RECONNECT) return;
    reconnectAttempts.value++;
    reconnectTimer = setTimeout(() => connect(channel), RECONNECT_DELAY * reconnectAttempts.value);
  }

  function send(data: Record<string, unknown>) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  return {
    isConnected,
    reconnectAttempts,
    on,
    off,
    connect,
    disconnect,
    send,
  };
}
