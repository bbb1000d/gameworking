import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireUser } from "../auth/guard";
import { skillTree } from "@rogue/shared";

const allocationSchema = z.object({
  nodeKey: z.string(),
  rank: z.number().int().min(0).max(5),
});

export const registerSkillRoutes = (app: FastifyInstance) => {
  app.get("/skill-tree", async () => {
    return { nodes: skillTree };
  });

  app.post("/characters/:id/skills/allocate", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const params = z.object({ id: z.string().cuid() }).safeParse(request.params);
    if (!params.success) return reply.badRequest("Invalid character id");

    const body = allocationSchema.safeParse(request.body);
    if (!body.success) return reply.badRequest("Invalid payload");

    const character = await prisma.character.findFirst({
      where: { id: params.data.id, userId },
      include: { skills: { include: { node: true } } },
    });

    if (!character) return reply.notFound("Character not found");

    const node = skillTree.find((n) => n.key === body.data.nodeKey);
    if (!node) return reply.notFound("Skill node not found");

    for (const requirement of node.requires) {
      const allocation = character.skills.find(
        (skill) => skill.node?.key === requirement.nodeKey,
      );
      const rank = allocation?.rank ?? 0;
      if (rank < requirement.rank) {
        return reply.badRequest(`Requirement ${requirement.nodeKey} rank ${requirement.rank}`);
      }
    }

    if (node.gateUnlockKey) {
      const unlock = await prisma.unlock.findFirst({
        where: { characterId: character.id, key: node.gateUnlockKey },
      });
      if (!unlock) {
        return reply.badRequest("Gate node locked");
      }
    }

    const existing = character.skills.find((skill) => skill.node?.key === node.key);

    if (existing) {
      if (body.data.rank > node.maxRank) {
        return reply.badRequest("Rank exceeds max");
      }
      await prisma.skillAllocation.update({
        where: { id: existing.id },
        data: { rank: body.data.rank },
      });
    } else {
      await prisma.skillAllocation.create({
        data: {
          characterId: character.id,
          node: {
            connectOrCreate: {
              where: { key: node.key },
              create: {
                key: node.key,
                path: node.path,
                maxRank: node.maxRank,
                description: node.description,
                requiresJson: node.requires,
                synergiesJson: node.synergies ?? [],
              },
            },
          },
          rank: body.data.rank,
        },
      });
    }

    return { success: true };
  });
};
