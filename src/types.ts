import type { ServerWebSocket } from "bun";

export interface WebSocketData {
  userId: string;
  topic: string;
}

export type AppWebSocket = ServerWebSocket<WebSocketData>;

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
}

export type MessageHandler<T = unknown> = (
  ws: AppWebSocket,
  payload: T
) => void;
