import { nanoid } from "nanoid";

export type EntityId = string;
export type Component<T> = Map<EntityId, T>;

export type SystemContext = {
  dt: number;
  time: number;
};

export type System = (world: World, context: SystemContext) => void;

export class World {
  private systems: System[] = [];
  private time = 0;

  readonly components = new Map<string, Component<unknown>>();

  createEntity(): EntityId {
    return nanoid();
  }

  registerComponent<T>(key: string): Component<T> {
    if (this.components.has(key)) {
      throw new Error(`Component ${key} already registered`);
    }

    const storage: Component<T> = new Map();
    this.components.set(key, storage);
    return storage;
  }

  getComponent<T>(key: string): Component<T> {
    const storage = this.components.get(key);
    if (!storage) {
      throw new Error(`Component ${key} not registered`);
    }

    return storage as Component<T>;
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  tick(dt: number): void {
    this.time += dt;
    const context: SystemContext = { dt, time: this.time };
    for (const system of this.systems) {
      system(this, context);
    }
  }
}

export type Vector2 = { x: number; y: number };

export type Transform = {
  position: Vector2;
};

export type Velocity = {
  velocity: Vector2;
  maxSpeed: number;
  acceleration: number;
};

export type Collider = {
  width: number;
  height: number;
  solid: boolean;
};

export const createMovementSystem = (
  transformKey: string,
  velocityKey: string,
) =>
  ((world: World, { dt }: SystemContext) => {
    const transforms = world.getComponent<Transform>(transformKey);
    const velocities = world.getComponent<Velocity>(velocityKey);

    for (const [entity, velocity] of velocities.entries()) {
      const transform = transforms.get(entity);
      if (!transform) continue;

      const nextX = transform.position.x + velocity.velocity.x * dt;
      const nextY = transform.position.y + velocity.velocity.y * dt;

      transform.position.x = Number(nextX.toFixed(4));
      transform.position.y = Number(nextY.toFixed(4));
    }
  }) as System;

export const createFrictionSystem = (
  velocityKey: string,
  friction: number,
) =>
  ((world: World, { dt }: SystemContext) => {
    const velocities = world.getComponent<Velocity>(velocityKey);

    for (const velocity of velocities.values()) {
      velocity.velocity.x -= velocity.velocity.x * friction * dt;
      velocity.velocity.y -= velocity.velocity.y * friction * dt;

      const speed = Math.hypot(velocity.velocity.x, velocity.velocity.y);
      if (speed > velocity.maxSpeed) {
        const scale = velocity.maxSpeed / speed;
        velocity.velocity.x *= scale;
        velocity.velocity.y *= scale;
      }

      if (Math.abs(velocity.velocity.x) < 0.0001) velocity.velocity.x = 0;
      if (Math.abs(velocity.velocity.y) < 0.0001) velocity.velocity.y = 0;
    }
  }) as System;

export const createCollisionSystem = (
  transformKey: string,
  colliderKey: string,
) =>
  ((world: World) => {
    const transforms = world.getComponent<Transform>(transformKey);
    const colliders = world.getComponent<Collider>(colliderKey);

    const entries = [...colliders.entries()];
    for (let i = 0; i < entries.length; i += 1) {
      const [entityA, colliderA] = entries[i];
      const transformA = transforms.get(entityA);
      if (!transformA) continue;

      for (let j = i + 1; j < entries.length; j += 1) {
        const [entityB, colliderB] = entries[j];
        const transformB = transforms.get(entityB);
        if (!transformB) continue;

        if (aabbOverlap(transformA, colliderA, transformB, colliderB)) {
          resolveOverlap(transformA, colliderA, transformB, colliderB);
        }
      }
    }
  }) as System;

const aabbOverlap = (
  transformA: Transform,
  colliderA: Collider,
  transformB: Transform,
  colliderB: Collider,
) => {
  return !(
    transformA.position.x + colliderA.width / 2 <
      transformB.position.x - colliderB.width / 2 ||
    transformA.position.x - colliderA.width / 2 >
      transformB.position.x + colliderB.width / 2 ||
    transformA.position.y + colliderA.height / 2 <
      transformB.position.y - colliderB.height / 2 ||
    transformA.position.y - colliderA.height / 2 >
      transformB.position.y + colliderB.height / 2
  );
};

const resolveOverlap = (
  transformA: Transform,
  colliderA: Collider,
  transformB: Transform,
  colliderB: Collider,
) => {
  const overlapX =
    Math.min(
      transformA.position.x + colliderA.width / 2,
      transformB.position.x + colliderB.width / 2,
    ) -
    Math.max(
      transformA.position.x - colliderA.width / 2,
      transformB.position.x - colliderB.width / 2,
    );
  const overlapY =
    Math.min(
      transformA.position.y + colliderA.height / 2,
      transformB.position.y + colliderB.height / 2,
    ) -
    Math.max(
      transformA.position.y - colliderA.height / 2,
      transformB.position.y - colliderB.height / 2,
    );

  if (overlapX < overlapY) {
    const direction =
      transformA.position.x < transformB.position.x ? -overlapX : overlapX;
    transformA.position.x += direction / 2;
    transformB.position.x -= direction / 2;
  } else {
    const direction =
      transformA.position.y < transformB.position.y ? -overlapY : overlapY;
    transformA.position.y += direction / 2;
    transformB.position.y -= direction / 2;
  }
};

export const runFixedStep = (
  world: World,
  systems: System[],
  dt = 1 / 60,
  totalTime = 1,
) => {
  systems.forEach((system) => world.addSystem(system));
  const steps = Math.floor(totalTime / dt);
  for (let i = 0; i < steps; i += 1) {
    world.tick(dt);
  }
};
