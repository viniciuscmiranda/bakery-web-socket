import express from "express";

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

    this.initLogger();
    this.initRoutes();
  }

  public listen() {
    this.server.listen(this.port, () => {
      logger.log(`Servidor iniciado na porta ${this.port}...`);
    });
  }

  private initRoutes() {
    this.server.get("/messages", getMessages);
    this.server.get("/messages/long-polling", getMessagesLongPolling);
    this.server.get(
      "/messages/server-sent-events",
      getMessagesServerSentEvents
    );

    this.server.post("/messages", createMessage);
  }

  private initLogger() {
    this.server.use((req, res, next) => {
      logger.log(`${req.method} ${req.path} - Nova requisição`);

      res.on("finish", () => {
        logger.log(
          `${req.method} ${req.path} [${res.statusCode}] - Resposta enviada`
        );
      });

      next();
    });
  }
}
