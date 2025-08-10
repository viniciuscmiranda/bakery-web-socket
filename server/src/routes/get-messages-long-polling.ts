import { Request, Response } from "express";

import { MessageBroker, type Message } from "../services/message-broker";

const TIMEOUT = 20_000; // 20 segundos

export const getMessagesLongPolling = (req: Request, res: Response) => {
  const lastMessageTimestamp =
    req.query.lastMessageTimestamp && String(req.query.lastMessageTimestamp);

  // Filtra as mensagens que o cliente ainda não recebeu
  function getNewMessages(timestamp?: string) {
    return MessageBroker.getMessages().filter((message) => {
      if (!timestamp) return true;
      return new Date(message.timestamp) > new Date(timestamp);
    });
  }

  const messages = getNewMessages(lastMessageTimestamp);

  // Se já existem mensagens que o cliente não recebeu, retorna as mensagens existentes
  if (messages.length > 0) {
    res.json(messages);
    return;
  }

  function messageHandler() {
    res.json(getNewMessages(lastMessageTimestamp));
  }

  MessageBroker.subscribe(messageHandler);

  // Timeout caso demore muito para receber uma nova mensagem
  const timeout = setTimeout(() => {
    res.status(204).send([]);
  }, TIMEOUT);

  function closeConnection() {
    clearTimeout(timeout);
    MessageBroker.unsubscribe(messageHandler);
  }

  // Limpar quando a conexão for fechada
  res.on("close", closeConnection);
  // Limpar quando há erro na conexão
  res.on("error", closeConnection);
};
