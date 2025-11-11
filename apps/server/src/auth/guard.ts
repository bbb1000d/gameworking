import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyAuthToken } from "./jwt";

export const requireUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.cookies["auth_token"];
  if (!token) {
    reply.unauthorized("Missing auth token");
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    reply.unauthorized("Invalid auth token");
    return null;
  }

  request.user = { id: payload.userId };
  return payload.userId;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string };
  }
}
