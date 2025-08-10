import WebSocket, { RawData, WebSocketServer as WSS } from "ws";

import { Message, MessageBroker } from "../services/message-broker";
import { Logger } from "../utils/logger";

import { generateId } from "../utils/generate-id";
import { CreateMessageSchema } from "../schemas/message";

const logger = new Logger("🔌 WebSocketServer");

type WebSocketClient = {
  id: string;
  ws: WebSocket;
  send: (message: Message) => void;
};

export class WebSocketServer {
  private server: WSS;
  private clients: WebSocketClient[] = [];

  constructor(private port: number) {
    this.server = new WSS({ port });
  }

  listen() {
    this.server.on("connection", (ws) => this.onConnection(ws));

    this.server.on("listening", () => {
      logger.log(`Servidor iniciado na porta ${this.port}...`);
    });
  }

  private onConnection(ws: WebSocket) {
    const client: WebSocketClient = {
      ws,
      id: generateId("ws"),
      send: (message) => ws.send(JSON.stringify(message)),
    };

    logger.log(`${client.id} - Cliente conectado.`);
    MessageBroker.send(`Cliente "${client.id}" se conectou ao servidor.`);

    ws.on("message", (data) => this.onClientMessage(client, data));
    ws.on("close", () => this.onClientClose(client));
    ws.on("error", () => this.onClientClose(client));

    this.clients.push(client);
    MessageBroker.subscribe(client.send);
  }

  private onClientMessage(_client: WebSocketClient, raw: RawData) {
    const json = JSON.parse(raw.toString());

    logger.log(`${_client.id} - Mensagem recebida: ${JSON.stringify(json)}`);

    const { success, data } = CreateMessageSchema.safeParse(json);
    if (success) MessageBroker.send(data.message);
  }

  private onClientClose(client: WebSocketClient) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close();
    }

    this.clients = this.clients.filter((c) => c.id !== client.id);
    logger.log(`${client.id} - Cliente desconectado.`);

    MessageBroker.unsubscribe(client.send);
    MessageBroker.send(`Cliente "${client.id}" se desconectou do servidor.`);
  }
}
