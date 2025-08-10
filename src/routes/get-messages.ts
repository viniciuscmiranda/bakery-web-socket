import { Request, Response } from "express";

import { MessageBroker } from "../services/message-broker";

export function getMessages(_req: Request, res: Response) {
  return res.json({ messages: MessageBroker.getMessages() });
}
