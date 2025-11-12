import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifySensible from "@fastify/sensible";
import { registerAuthRoutes } from "./routes/auth";
import { registerCharacterRoutes } from "./routes/characters";
import { registerSkillRoutes } from "./routes/skill";
import { registerRunRoutes } from "./routes/runs";

export const createServer = () => {
  const server = Fastify({ logger: true });
  server.register(fastifyCors, {
    origin: true,
    credentials: true,
  });
  server.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? "dev-secret",
  });
  server.register(fastifySensible);

  server.get("/health", async () => ({ status: "ok" }));

  server.log.info(
    {
      databaseProvider: process.env.DATABASE_PROVIDER,
      databaseUrl: process.env.DATABASE_URL,
    },
    "database configuration loaded",
  );

  registerAuthRoutes(server);
  registerCharacterRoutes(server);
  registerSkillRoutes(server);
  registerRunRoutes(server);

  return server;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer();
  const port = Number(process.env.PORT ?? 4000);
  server.listen({ port, host: "0.0.0.0" }).catch((error) => {
    server.log.error(error, "Failed to start server");
    process.exit(1);
  });
}
