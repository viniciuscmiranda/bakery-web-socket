import express from "express";

import { Logger } from "../../utils/logger";

import { login } from "./routes/login";
import { getMessages } from "./routes/get-messages";
import { getMessagesLongPooling } from "./routes/get-messages-long-pooling";
import { createMessage } from "./routes/create-message";
import { AuthUtils } from "../../utils/auth";
import { getMessagesSSE } from "./routes/get-messages-sse";

export class HttpServer {
  private app: express.Application;
  private port: number;
  private logger: Logger;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.logger = new Logger("🌎 HttpServer");

    this.app.use(express.json());

    this.registerAuthMiddleware();
    this.registerLogger();
    this.registerRoutes();
  }

  public listen() {
    this.app.listen(this.port, () => {
      this.logger.log(`Server is running on port ${this.port}...`);
    });
  }

  private registerRoutes() {
    this.app.post("/login", login);
    this.app.post("/messages", createMessage);
    this.app.get("/messages", getMessages);
    this.app.get("/messages/long-pooling", getMessagesLongPooling);
    this.app.get("/messages/sse", getMessagesSSE);
  }

  private registerLogger() {
    this.app.use((req, res, next) => {
      this.logger.log(`${req.method} ${req.path} - Incoming request`);

      res.on("finish", () => {
        this.logger.log(
          `${req.method} ${req.path} - Returned ${res.statusCode}`
        );
      });

      next();
    });
  }

  private registerAuthMiddleware() {
    this.app.use((req, res, next) => {
      if (req.path === "/login") return next();

      const token = req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token não encontrado" });
      }

      const decoded = AuthUtils.verifyToken(token as string);

      if (!decoded) {
        return res.status(401).json({ message: "Token inválido" });
      }

      next();
    });
  }
}
