import express from "express";
import cors from "cors";

import { Logger } from "../utils/logger";

import {
  createMessage,
  getMessages,
  getMessagesLongPolling,
  getMessagesServerSentEvents,
} from "../routes";

const logger = new Logger("🌎 HttpServer");

export class HttpServer {
  private server: express.Application;

  constructor(private port: number) {
    this.server = express();
    this.server.use(express.json());
    this.server.use(cors());

    this.server.use((req, _res, next) => {
      logger.log(`${req.method} ${req.path} - Nova requisição`);
      next();
    });

    this.server.post("/messages", createMessage);
    this.server.get("/messages", getMessages);
    this.server.get("/messages/long-polling", getMessagesLongPolling);
    this.server.get(
      "/messages/server-sent-events",
      getMessagesServerSentEvents
    );
  }

  public listen() {
    this.server.listen(this.port, () => {
      logger.log(`Servidor iniciado na porta ${this.port}...`);
    });
  }
}
