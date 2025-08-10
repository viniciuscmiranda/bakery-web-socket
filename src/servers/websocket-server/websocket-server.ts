import { WebSocketServer as WSS } from "ws";

import { MessageBroker, Message } from "../../services/message-broker";
import { Logger } from "../../utils/logger";

import { WebSocketClient } from "./websocket-client";

export class WebSocketServer {
  private wss: WSS;
  private port: number;
  private clients: WebSocketClient[] = [];
  private logger: Logger;

  constructor(port: number) {
    this.port = port;
    this.wss = new WSS({ port });
    this.logger = new Logger("🔌 WebSocketServer");
  }

  listen() {
    this.wss.on("listening", () => this.onListening());
    this.wss.on("error", (error) => this.onError(error));
    this.wss.on("connection", (ws) => {
      const client = new WebSocketClient(ws, (client) => {
        this.clients = this.clients.filter((c) => c.id !== client.id);
      });

      this.onConnection(client);
    });
  }

  private onListening() {
    this.logger.log(`Server is running on port ${this.port}...`);
  }

  private onError(error: Error) {
    this.logger.log(`Server error: ${error}`);
  }

  private onConnection(client: WebSocketClient) {
    this.logger.log(`New connection established: ${client.id}`);

    MessageBroker.send(
      new Message("message", `Cliente "${client.id}" se conectou ao servidor.`)
    );

    client.ws.on("message", (data) => client.onMessage(data));
    client.ws.on("close", () => client.onClose());
    client.ws.on("error", (error) => client.onError(error));

    this.clients.push(client);
  }
}
