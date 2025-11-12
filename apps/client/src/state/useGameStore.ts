import create from "zustand";
import { nanoid } from "nanoid";
import { clampMagnitude, magnitude, normalize, type SkillNode, type Stats } from "@rogue/shared";

type Vector = { x: number; y: number };

type Projectile = {
  id: string;
  position: Vector;
  direction: Vector;
  speed: number;
  lifetime: number;
};

type Enemy = {
  id: string;
  position: Vector;
  hp: number;
};

type PlayerState = {
  position: Vector;
  velocity: Vector;
};

type GameState = {
  tick: number;
  pointer: Vector;
  input: Vector;
  projectiles: Projectile[];
  enemies: Enemy[];
  player: PlayerState;
  stats: Stats;
  skillNodes: SkillNode[];
  setSkillNodes: (nodes: SkillNode[]) => void;
  setInput: (next: Partial<{ movement: Vector; pointer: Vector }>) => void;
  fire: () => void;
  step: (dt: number) => void;
};

const defaultStats: Stats = {
  hp: 120,
  shield: 40,
  stamina: 100,
  moveSpeed: 6,
  fireRate: 2,
  reload: 1,
  critChance: 5,
  critDamage: 150,
  firePower: 10,
  icePower: 10,
  voltPower: 10,
  dashCharges: 1,
  cdr: 0.05,
};

const SPAWN_ARENA = { width: 800, height: 440 };

const spawnEnemies = (): Enemy[] => {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `enemy-${index}`,
    position: {
      x: 100 + index * 140,
      y: 120 + (index % 2) * 180,
    },
    hp: 50,
  }));
};

export const useGameStore = create<GameState>((set) => ({
  tick: 0,
  pointer: { x: SPAWN_ARENA.width / 2, y: SPAWN_ARENA.height / 2 },
  input: { x: 0, y: 0 },
  projectiles: [],
  enemies: spawnEnemies(),
  player: {
    position: { x: SPAWN_ARENA.width / 2, y: SPAWN_ARENA.height - 120 },
    velocity: { x: 0, y: 0 },
  },
  stats: defaultStats,
  skillNodes: [],
  setSkillNodes: (nodes) => set({ skillNodes: nodes }),
  setInput: (next) =>
    set((state) => ({
      input: next.movement ? next.movement : state.input,
      pointer: next.pointer ? next.pointer : state.pointer,
    })),
  fire: () =>
    set((state) => {
      const direction = normalize({
        x: state.pointer.x - state.player.position.x,
        y: state.pointer.y - state.player.position.y,
      });
      return {
        projectiles: [
          ...state.projectiles,
          {
            id: nanoid(),
            position: { ...state.player.position },
            direction,
            speed: 320,
            lifetime: 1.2,
          },
        ],
      };
    }),
  step: (dt) => {
    set((state) => {
      const player = { ...state.player };
      const input = clampMagnitude(state.input, 1);
      const speed = state.stats.moveSpeed * 60;
      player.velocity.x = input.x * speed;
      player.velocity.y = input.y * speed;
      player.position.x = Math.max(40, Math.min(SPAWN_ARENA.width - 40, player.position.x + player.velocity.x * dt));
      player.position.y = Math.max(40, Math.min(SPAWN_ARENA.height - 40, player.position.y + player.velocity.y * dt));

      const projectiles = state.projectiles
        .map((projectile) => ({
          ...projectile,
          position: {
            x: projectile.position.x + projectile.direction.x * projectile.speed * dt,
            y: projectile.position.y + projectile.direction.y * projectile.speed * dt,
          },
          lifetime: projectile.lifetime - dt,
        }))
        .filter((projectile) => projectile.lifetime > 0);

      const enemies = state.enemies
        .map((enemy) => {
          const direction = normalize({
            x: player.position.x - enemy.position.x,
            y: player.position.y - enemy.position.y,
          });
          const speed = 120;
          return {
            ...enemy,
            position: {
              x: enemy.position.x + direction.x * speed * dt,
              y: enemy.position.y + direction.y * speed * dt,
            },
          };
        })
        .filter((enemy) => enemy.hp > 0);

      for (const projectile of projectiles) {
        for (const enemy of enemies) {
          const dist = magnitude({
            x: projectile.position.x - enemy.position.x,
            y: projectile.position.y - enemy.position.y,
          });
          if (dist < 24) {
            enemy.hp -= 15 + state.stats.firePower * 0.2;
            projectile.lifetime = 0;
          }
        }
      }

      const aliveProjectiles = projectiles.filter((p) => p.lifetime > 0);
      const aliveEnemies = enemies.filter((enemy) => enemy.hp > 0);

      const staminaDrain = magnitude(input) * 15 * dt;
      const staminaRegen = 10 * dt;
      const nextStamina = Math.max(0, Math.min(120, state.stats.stamina - staminaDrain + staminaRegen));

      return {
        tick: state.tick + 1,
        player,
        projectiles: aliveProjectiles,
        enemies: aliveEnemies,
        stats: { ...state.stats, stamina: nextStamina },
      };
    });
  },
}));
