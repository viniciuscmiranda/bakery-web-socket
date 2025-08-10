import z from "zod";

export const CreateMessageSchema = z.object({
  message: z
    .string("Mensagem é obrigatória")
    .max(300, "Mensagem deve ter no máximo 300 caracteres"),
});
