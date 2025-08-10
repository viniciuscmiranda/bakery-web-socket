import { Request, Response } from "express";

import { MessageBroker, Message } from "../../../services/message-broker";
import { Logger } from "../../../utils/logger";

const logger = new Logger("📡 LongPolling");

const TIMEOUT = 30000;

export const getMessagesLongPooling = (req: Request, res: Response) => {
  logger.log(`Client connected...`);

  MessageBroker.send(
    new Message("message", "Long polling connection established")
  );

  const messageHandler = (message: Message) => {
    logger.log(`Sending message: "${message.message}"`);
    res.json(message.toJSON());
  };

  MessageBroker.subscribe(messageHandler);

  // Timeout para evitar conexões infinitas
  req.setTimeout(TIMEOUT, () => {
    logger.log(`Long polling timeout after ${TIMEOUT}ms`);
    res.json(null);
  });

  // Limpar quando a conexão for fechada
  res.on("close", () => {
    logger.log("Client disconnected");
    MessageBroker.unsubscribe(messageHandler);
  });

  // Limpar quando a resposta for enviada
  res.on("finish", () => {
    MessageBroker.unsubscribe(messageHandler);
  });
};
