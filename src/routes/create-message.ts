import { Request, Response } from "express";

import { MessageBroker } from "../services/message-broker";
import { CreateMessageSchema } from "../schemas/message";

export function createMessage(req: Request, res: Response) {
  const { success, data, error } = CreateMessageSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ error: error.message });
  }

  const messageObject = MessageBroker.send(data.message);
  return res.json(messageObject);
}
