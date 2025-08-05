import { autoInjectable, inject } from "tsyringe";
import type { Server } from "bun";
import { WebSocketRouter } from "./websocket-router";
import type { AppWebSocket, WebSocketData } from "../shared/types";

@autoInjectable()
export class ServerService {
  private server: Server | null = null;

  constructor(
    @inject(WebSocketRouter) private readonly router: WebSocketRouter
  ) {}

  public start(): Server {
    const port = parseInt(process.env.PORT || "6974", 10);

    this.server = Bun.serve({
      port,
      fetch: (req, server) => {
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
        open: (ws: AppWebSocket) => {
          console.log(
            `WebSocket connection opened for user: ${ws.data.userId}`
          );
        },
        message: (ws: AppWebSocket, message) => {
          this.router.handleMessage(ws, message);
        },
        close: (ws: AppWebSocket, code, reason) => {
          console.log(
            `WebSocket connection closed for user: ${ws.data.userId}`,
            code,
            reason
          );
        },
      },
    });

    console.log(`WebSocket server listening on http://localhost:${port}`);
    return this.server;
  }

  public stop() {
    this.server?.stop();
  }
}
