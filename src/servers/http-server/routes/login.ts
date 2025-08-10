import { z } from "zod";
import { Request, Response } from "express";

import { AuthUtils } from "../../../utils/auth";

const users = [{ id: "1", username: "admin", password: "admin" }];

export function login(req: Request, res: Response) {
  const LoginSchema = z.object({
    username: z.string().min(1, "Username é obrigatório"),
    password: z.string().min(1, "Password é obrigatório"),
  });

  try {
    const { username, password } = LoginSchema.parse(req.body);

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    const token = AuthUtils.generateToken(user.id);

    return res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Dados inválidos",
        errors: error.issues,
      });
    }

    return res.status(500).json({
      message: "Erro interno do servidor",
    });
  }
}
