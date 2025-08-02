import "reflect-metadata";
import type { AppWebSocket, MessageHandler, WebSocketMessage } from "../types";

const messageHandlers = new Map<string, MessageHandler<any>>();

export function Method(type: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    messageHandlers.set(type, descriptor.value.bind(target));
  };
}

export function registerControllers(controllers: any[]) {
  controllers.forEach((controller) => new controller());
}

export function handleWebSocketMessage(
  ws: AppWebSocket,
  message: string | Buffer
) {
  try {
    const data: WebSocketMessage = JSON.parse(message.toString());
    const handler = messageHandlers.get(data.type);

    if (handler) {
      handler(ws, data.payload);
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { message: `Unknown message type: ${data.type}` },
        })
      );
    }
  } catch (e) {
    ws.send(
      JSON.stringify({
        type: "error",
        payload: { message: "Invalid JSON format" },
      })
    );
  }
}
