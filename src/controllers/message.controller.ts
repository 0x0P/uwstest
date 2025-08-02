import { Method } from "../websocket/message-handler";
import type { AppWebSocket } from "../types";

interface SendMessagePayload {
  content: string;
}

export class MessageController {
  @Method("send_message")
  handleSendMessage(ws: AppWebSocket, payload: SendMessagePayload) {
    console.log("Received message via decorator:", payload.content);
    ws.send(
      JSON.stringify({
        type: "message_confirmation",
        payload: {
          status: "ok",
          content: `Message "${payload.content}" received.`,
        },
      })
    );
  }

  @Method("test")
  handleTestMessage(ws: AppWebSocket) {
    ws.send(
      JSON.stringify({
        type: "test",
        payload: {
          message: "아침찬",
        },
      })
    );
  }
}
