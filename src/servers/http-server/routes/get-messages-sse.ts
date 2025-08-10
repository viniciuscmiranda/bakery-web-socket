import { Request, Response } from "express";

import { MessageBroker, Message } from "../../../services/message-broker";
import { Logger } from "../../../utils/logger";

const logger = new Logger("📡 SSE");

export const getMessagesSSE = (req: Request, res: Response) => {
  logger.log(`Client connected...`);

  // Configurar headers para SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  const messageHandler = (message: Message) => {
    logger.log(`Sending SSE message: "${message.message}"`);

    // Formato SSE: event + data + double newline
    const sseData = `event: message\ndata: ${JSON.stringify(
      message.toJSON()
    )}\n\n`;
    res.write(sseData);
  };

  MessageBroker.send(new Message("message", "SSE connection established"));

  // Subscribe para receber mensagens
  MessageBroker.subscribe(messageHandler);

  // Enviar heartbeat a cada 30 segundos para manter conexão
  const heartbeatInterval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeatInterval);
      return;
    }

    logger.log(`Sending heartbeat`);
    res.write(
      `event: heartbeat\ndata: ${JSON.stringify({
        timestamp: new Date().toISOString(),
      })}\n\n`
    );
  }, 30000);

  // Limpar quando a conexão for fechada
  req.on("close", () => {
    logger.log("SSE client disconnected");
    clearInterval(heartbeatInterval);
    MessageBroker.unsubscribe(messageHandler);
  });

  // Limpar quando a resposta for finalizada
  res.on("finish", () => {
    logger.log("SSE response finished");
    clearInterval(heartbeatInterval);
    MessageBroker.unsubscribe(messageHandler);
  });

  // Limpar quando há erro na conexão
  res.on("error", (error) => {
    logger.log(`SSE connection error: ${error}`);
    clearInterval(heartbeatInterval);
    MessageBroker.unsubscribe(messageHandler);
  });
};
