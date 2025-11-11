import { describe, expect, it } from "vitest";
import {
  World,
  createCollisionSystem,
  createFrictionSystem,
  createMovementSystem,
} from "../src/ecs";

describe("ECS", () => {
  it("updates movement with friction and resolves collisions", () => {
    const world = new World();
    const transforms = world.registerComponent("transform");
    const velocities = world.registerComponent("velocity");
    const colliders = world.registerComponent("collider");

    const entityA = world.createEntity();
    transforms.set(entityA, { position: { x: 0, y: 0 } });
    velocities.set(entityA, {
      velocity: { x: 10, y: 0 },
      maxSpeed: 10,
      acceleration: 10,
    });
    colliders.set(entityA, { width: 1, height: 1, solid: true });

    const entityB = world.createEntity();
    transforms.set(entityB, { position: { x: 0.4, y: 0 } });
    velocities.set(entityB, {
      velocity: { x: 0, y: 0 },
      maxSpeed: 10,
      acceleration: 0,
    });
    colliders.set(entityB, { width: 1, height: 1, solid: true });

    const movement = createMovementSystem("transform", "velocity");
    const friction = createFrictionSystem("velocity", 5);
    const collision = createCollisionSystem("transform", "collider");

    world.addSystem(friction);
    world.addSystem(movement);
    world.addSystem(collision);

    world.tick(0.016);

    const transformA = transforms.get(entityA)!;
    const transformB = transforms.get(entityB)!;
    expect(transformA.position.x).toBeLessThan(0.4);
    expect(Math.abs(transformA.position.x - transformB.position.x)).toBeLessThan(1);
  });
});
