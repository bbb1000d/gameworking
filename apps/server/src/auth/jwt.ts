import jwt from "jsonwebtoken";

const TOKEN_TTL = 60 * 60 * 24 * 7;

export type AuthTokenPayload = {
  userId: string;
};

export const signAuthToken = (payload: AuthTokenPayload) => {
  const secret = process.env.JWT_SECRET ?? "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: TOKEN_TTL });
};

export const verifyAuthToken = (token: string): AuthTokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET ?? "dev-secret";
    return jwt.verify(token, secret) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
};
