import type { FastifyInstance } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "../prisma";
import { signAuthToken } from "../auth/jwt";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerAuthRoutes = (app: FastifyInstance) => {
  app.post("/auth/register", async (request, reply) => {
    const result = credentialsSchema.safeParse(request.body);
    if (!result.success) {
      return reply.badRequest("Invalid credentials");
    }

    const { email, password } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.conflict("Email already registered");
    }

    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const token = signAuthToken({ userId: user.id });
    reply.setCookie("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return { id: user.id, email: user.email };
  });

  app.post("/auth/login", async (request, reply) => {
    const result = credentialsSchema.safeParse(request.body);
    if (!result.success) {
      return reply.badRequest("Invalid credentials");
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.unauthorized("Invalid email or password");
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return reply.unauthorized("Invalid email or password");
    }

    const token = signAuthToken({ userId: user.id });
    reply.setCookie("auth_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return { id: user.id, email: user.email };
  });

  app.post("/auth/logout", async (_request, reply) => {
    reply.clearCookie("auth_token", { path: "/" });
    return { success: true };
  });
};
