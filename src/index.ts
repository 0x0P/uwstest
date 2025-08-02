import {
  registerControllers,
  handleWebSocketMessage,
} from "./websocket/message-handler";
import { MessageController } from "./controllers/message.controller";
import type { AppWebSocket, WebSocketData } from "./types";

registerControllers([MessageController]);

const server = Bun.serve({
  port: 6974,
  fetch(req, server) {
    const success = server.upgrade(req, {
      data: {
        userId: `${Date.now()}`,
        topic: "general",
      } satisfies WebSocketData,
    });
    if (success) {
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    open(ws: AppWebSocket) {
      console.log(`WebSocket connection opened for user: ${ws.data.userId}`);
    },
    message(ws: AppWebSocket, message) {
      handleWebSocketMessage(ws, message);
    },
    close(ws: AppWebSocket, code, reason) {
      console.log(
        `WebSocket connection closed for user: ${ws.data.userId}`,
        code,
        reason
      );
    },
  },
});

console.log(`http://localhost:${server.port}`);
