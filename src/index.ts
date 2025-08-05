import "reflect-metadata";
import "dotenv/config";
import { container } from "tsyringe";
import { ServerService } from "./core/server.service";
import { MessageController } from "./features/message/message.controller";

container.register("MessageController", {
  useClass: MessageController,
});

const server = container.resolve(ServerService);

server.start();
