import { Request, Response } from "express";

import { MessageBroker } from "../services/message-broker";
import { generateId } from "../utils/generate-id";

const TIMEOUT = 20000; // 20 segundos

export const getMessagesLongPolling = (req: Request, res: Response) => {
  const id = generateId("lp");

  MessageBroker.send(`Cliente "${id}" se conectou ao servidor.`);

  function messageHandler() {
    res.json(MessageBroker.getMessages());
  }

  function closeConnection() {
    MessageBroker.unsubscribe(messageHandler);
    MessageBroker.send(`Cliente "${id}" desconectou do servidor.`);
  }

  MessageBroker.subscribe(messageHandler);

  // Timeout caso demore muito para receber uma nova mensagem
  req.setTimeout(TIMEOUT, () => {
    res.json(MessageBroker.getMessages());
  });

  // Limpar quando a conexão for fechada
  res.on("close", closeConnection);
  // Limpar quando há erro na conexão
  res.on("error", closeConnection);
};
