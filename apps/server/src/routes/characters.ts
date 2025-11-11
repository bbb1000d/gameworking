import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireUser } from "../auth/guard";
import type { Stats } from "@rogue/shared";

const createCharacterSchema = z.object({
  name: z.string().min(2).max(32),
});

const defaultStats: Stats = {
  hp: 100,
  shield: 40,
  stamina: 100,
  moveSpeed: 5,
  fireRate: 1,
  reload: 1,
  critChance: 5,
  critDamage: 150,
  firePower: 0,
  icePower: 0,
  voltPower: 0,
  dashCharges: 1,
  cdr: 0,
};

export const registerCharacterRoutes = (app: FastifyInstance) => {
  app.get("/me", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        characters: {
          select: { id: true, name: true, level: true, xp: true },
        },
      },
    });

    if (!user) return reply.notFound("User not found");

    return {
      id: user.id,
      email: user.email,
      characters: user.characters,
    };
  });

  app.post("/characters", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const result = createCharacterSchema.safeParse(request.body);
    if (!result.success) {
      return reply.badRequest("Invalid name");
    }

    const character = await prisma.character.create({
      data: {
        userId,
        name: result.data.name,
        statsJson: defaultStats,
      },
    });

    return character;
  });

  app.get("/characters/:id", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const params = z.object({ id: z.string().cuid() }).safeParse(request.params);
    if (!params.success) {
      return reply.badRequest("Invalid id");
    }

    const character = await prisma.character.findFirst({
      where: { id: params.data.id, userId },
      include: {
        skills: { include: { node: true } },
        inventory: { include: { item: true } },
      },
    });

    if (!character) return reply.notFound("Character not found");

    return character;
  });
};
