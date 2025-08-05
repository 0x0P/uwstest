import { singleton } from "tsyringe";
import type { AppWebSocket } from "../../shared/types";
import { z } from "zod";

const SendMessagePayloadSchema = z.object({
  content: z.string().min(1),
});

type SendMessagePayload = z.infer<typeof SendMessagePayloadSchema>;

@singleton()
export class MessageController {
  public handleSendMessage(ws: AppWebSocket, payload: unknown) {
    const validation = SendMessagePayloadSchema.safeParse(payload);
    if (!validation.success) {
      this.sendValidationError(ws, validation.error);
      return;
    }

    const { content } = validation.data;
    console.log("Received message:", content);
    ws.send(
      JSON.stringify({
        type: "message_confirmation",
        payload: {
          status: "ok",
          content: `Message "${content}" received.`,
        },
      })
    );
  }

  public handleTest(ws: AppWebSocket) {
    ws.send(
      JSON.stringify({
        type: "test_response",
        payload: {
          message: "Test successful!",
        },
      })
    );
  }

  private sendValidationError(ws: AppWebSocket, error: z.ZodError) {
    ws.send(
      JSON.stringify({
        type: "error",
        payload: {
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
      })
    );
  }
}
