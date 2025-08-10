import z from "zod";
import { Request, Response } from "express";

import { MessageBroker, Message } from "../../../services/message-broker";

export function createMessage(req: Request, res: Response) {
  const schema = z.object({
    message: z
      .string("Mensagem é obrigatória")
      .max(300, "Mensagem deve ter no máximo 300 caracteres"),
  });

  try {
    const { message: content } = schema.parse(req.body);

    const message = new Message("message", content);
    MessageBroker.send(message);

    return res.json(message.toJSON());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Message inválido", errors: error.issues });
    }

    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
