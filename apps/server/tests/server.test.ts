import request from "supertest";
import { createServer } from "../src";

const server = createServer();

describe("server", () => {
  afterAll(async () => {
    await server.close();
  });

  it("returns health", async () => {
    const response = await request(server.server).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("exposes skill tree", async () => {
    const response = await request(server.server).get("/skill-tree");
    expect(response.status).toBe(200);
    expect(response.body.nodes).toBeInstanceOf(Array);
    expect(response.body.nodes.length).toBeGreaterThan(10);
  });
});
