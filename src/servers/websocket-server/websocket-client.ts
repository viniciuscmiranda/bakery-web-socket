import { z } from "zod";
import WebSocket, { RawData } from "ws";

import { MessageBroker, Message } from "../../services/message-broker";
import { Logger } from "../../utils/logger";
import { AuthUtils } from "../../utils/auth";

export class WebSocketClient {
  id: string;
  private boundSend: (message: Message) => void;
  private logger: Logger;

  constructor(
    public ws: WebSocket,
    private onDisconnect: (client: WebSocketClient) => void
  ) {
    this.id = Math.random().toString(36).substring(2, 8);
    this.boundSend = this.send.bind(this);
    this.logger = new Logger(`🔌 WebSocketClient - ${this.id}`);

    MessageBroker.subscribe(this.boundSend);
  }

  send(message: Message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.logger.log(`Sending message: "${message.message}"`);
      this.ws.send(message.toString());
    }
  }

  onMessage(data: RawData) {
    const schema = z.object({
      token: z.string("Token é obrigatório"),
      message: z
        .string("Mensagem é obrigatória")
        .max(300, "Mensagem deve ter no máximo 300 caracteres"),
    });

    try {
      const { token, message } = schema.parse(JSON.parse(data.toString()));

      const decoded = AuthUtils.verifyToken(token);

      if (!decoded) {
        this.send(new Message("error", "Token inválido"));
        this.onClose();
        return;
      }

      MessageBroker.send(new Message("message", message));
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.send(new Message("error", error.message));
        return;
      }

      this.send(new Message("error", "Erro ao processar mensagem"));
    }
  }

  onClose() {
    this.logger.log(`Connection closed`);

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    MessageBroker.unsubscribe(this.boundSend);
    this.onDisconnect(this);

    MessageBroker.send(
      new Message("message", `Cliente "${this.id}" se desconectou do servidor.`)
    );
  }

  onError(error: Error) {
    this.logger.log(`Connection error: ${error}`);
    this.onClose();
  }
}
