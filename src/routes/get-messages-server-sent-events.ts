import { Request, Response } from "express";

import { MessageBroker, Message } from "../services/message-broker";
import { generateId } from "../utils/generate-id";

export const getMessagesServerSentEvents = (req: Request, res: Response) => {
  const id = generateId("sse");

  MessageBroker.send(`Cliente "${id}" se conectou ao servidor.`);

  // Configurar headers para SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  function messageHandler(message: Message) {
    res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
  }

  function closeConnection() {
    MessageBroker.unsubscribe(messageHandler);
    MessageBroker.send(`Cliente "${id}" desconectou do servidor.`);
  }

  // Subscribe para receber mensagens
  MessageBroker.subscribe(messageHandler);

  // Limpar quando a conexão for fechada
  req.on("close", closeConnection);
  // Limpar quando a resposta for finalizada
  res.on("finish", closeConnection);
  // Limpar quando há erro na conexão
  res.on("error", closeConnection);
};
