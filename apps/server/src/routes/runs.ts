import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireUser } from "../auth/guard";
import { bosses } from "@rogue/shared";
import { nanoid } from "nanoid";

const createRunSchema = z.object({
  tier: z.number().int().min(1).max(5),
});

const completeRunSchema = z.object({
  outcome: z.enum(["success", "failure"]),
  bossKey: z.string(),
  durationMs: z.number().int().positive(),
});

export const registerRunRoutes = (app: FastifyInstance) => {
  app.post("/runs", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const body = createRunSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest("Invalid payload");

    const { tier } = body.data;
    const character = await prisma.character.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (!character) return reply.badRequest("Create a character first");

    const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const run = await prisma.dungeonRun.create({
      data: {
        id: nanoid(),
        characterId: character.id,
        seed,
        tier,
        outcome: "in-progress",
        metricsJson: {},
      },
    });

    return run;
  });

  app.post("/runs/:id/complete", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const params = z.object({ id: z.string() }).safeParse(request.params);
    if (!params.success) return reply.badRequest("Invalid run id");

    const body = completeRunSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest("Invalid payload");

    const run = await prisma.dungeonRun.findFirst({
      where: { id: params.data.id, character: { userId } },
    });

    if (!run) return reply.notFound("Run not found");

    const boss = bosses.find((b) => b.key === body.data.bossKey);
    if (!boss) return reply.badRequest("Unknown boss");

    const completed = await prisma.dungeonRun.update({
      where: { id: run.id },
      data: {
        outcome: body.data.outcome,
        completedAt: new Date(),
        boss: {
          connectOrCreate: {
            where: { key: boss.key },
            create: { key: boss.key, name: boss.name, unlockKey: boss.unlockKey },
          },
        },
        metricsJson: { durationMs: body.data.durationMs },
      },
    });

    if (body.data.outcome === "success") {
      await prisma.unlock.upsert({
        where: {
          characterId_key: {
            characterId: run.characterId,
            key: boss.unlockKey,
          },
        },
        update: { valueJson: { unlockedAt: new Date().toISOString() } },
        create: {
          characterId: run.characterId,
          key: boss.unlockKey,
          valueJson: { unlockedAt: new Date().toISOString() },
        },
      });

      await prisma.leaderboard.upsert({
        where: { characterId: run.characterId },
        update: {
          bestTier: run.tier,
          bestTimeMs: body.data.durationMs,
          updatedAt: new Date(),
        },
        create: {
          characterId: run.characterId,
          bestTier: run.tier,
          bestTimeMs: body.data.durationMs,
        },
      });
    }

    return completed;
  });
};
