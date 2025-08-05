import { autoInjectable, container } from "tsyringe";
import type { AppWebSocket, WebSocketMessage } from "../shared/types";

@autoInjectable()
export class WebSocketRouter {
  public handleMessage(ws: AppWebSocket, message: string | Buffer) {
    try {
      const data: WebSocketMessage = JSON.parse(message.toString());

      const controller = container.resolve("MessageController") as any;

      const handler = this.findHandler(controller, data.type);

      if (handler) {
        handler.call(controller, ws, data.payload);
      } else {
        this.sendError(ws, `Unknown message type: ${data.type}`);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        this.sendError(ws, "Invalid JSON format");
      } else {
        console.error("Error handling message:", e);
        this.sendError(ws, "An unexpected error occurred");
      }
    }
  }

  private findHandler(
    controller: any,
    type: string
  ): ((ws: AppWebSocket, payload: any) => void) | null {
    const handlerName = `handle${this.toPascalCase(type)}`;
    if (typeof controller[handlerName] === "function") {
      return controller[handlerName];
    }
    return null;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/_(\w)/g, (_, c) => c.toUpperCase())
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  private sendError(ws: AppWebSocket, message: string) {
    ws.send(
      JSON.stringify({
        type: "error",
        payload: { message },
      })
    );
  }
}
