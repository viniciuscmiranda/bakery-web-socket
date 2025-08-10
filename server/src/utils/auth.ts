import jwt from "jsonwebtoken";

class AuthUtilsClass {
  public generateToken(userId: string) {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
  }

  public verifyToken(token: string) {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

    return jwt.verify(token, JWT_SECRET);
  }
}

export const AuthUtils = new AuthUtilsClass();
