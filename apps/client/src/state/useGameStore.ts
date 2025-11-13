import create from "zustand";
import { nanoid } from "nanoid";
import {
  clampMagnitude,
  magnitude,
  normalize,
  type SkillNode,
  type Stats,
} from "@rogue/shared";

type Vector = { x: number; y: number };

export type ItemDefinition = {
  id: string;
  name: string;
  type: "weapon" | "shield" | "armor" | "medal" | "relic";
  description: string;
  value: number;
};

type Projectile = {
  id: string;
  position: Vector;
  direction: Vector;
  speed: number;
  lifetime: number;
};

type Enemy = {
  id: string;
  name: string;
  position: Vector;
  hp: number;
  maxHp: number;
  type: "mob" | "boss";
  damage: number;
  gold: number;
  elixir: number;
  lootTable: string[];
};

type PlayerState = {
  position: Vector;
  velocity: Vector;
};

type Location = {
  id: string;
  name: string;
  type: "city" | "dungeon" | "house";
  position: Vector;
  size: { width: number; height: number };
  description?: string;
};

type Chest = {
  id: string;
  position: Vector;
  lootTable: string[];
  gold: number;
  opened: boolean;
};

type GamePhase = "menu" | "playing";

type GameState = {
  tick: number;
  pointer: Vector;
  input: Vector;
  projectiles: Projectile[];
  enemies: Enemy[];
  player: PlayerState;
  stats: Stats;
  skillNodes: SkillNode[];
  phase: GamePhase;
  locations: Location[];
  chests: Chest[];
  inventory: Record<string, number>;
  gold: number;
  elixirs: number;
  camera: Vector;
  setSkillNodes: (nodes: SkillNode[]) => void;
  setInput: (next: Partial<{ movement: Vector; pointer: Vector }>) => void;
  fire: () => void;
  step: (dt: number) => void;
  startGame: () => void;
};

export const WORLD_SIZE = { width: 2400, height: 1800 };
export const VIEWPORT_SIZE = { width: 960, height: 540 };

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

export const ITEM_LIBRARY: Record<string, ItemDefinition> = {
  "ember-blade": {
    id: "ember-blade",
    name: "Ember Blade",
    type: "weapon",
    description: "A lightweight sword that leaves a trail of flame.",
    value: 150,
  },
  "frost-bow": {
    id: "frost-bow",
    name: "Frost Whisper Bow",
    type: "weapon",
    description: "Crystallised arrows slow anything they touch.",
    value: 210,
  },
  "volt-lance": {
    id: "volt-lance",
    name: "Volt Lance",
    type: "weapon",
    description: "Crackling spear built for piercing boss armour.",
    value: 320,
  },
  "ironward-shield": {
    id: "ironward-shield",
    name: "Ironward Shield",
    type: "shield",
    description: "Reliable bulwark forged in the frontier foundries.",
    value: 110,
  },
  "dawning-bulwark": {
    id: "dawning-bulwark",
    name: "Dawning Bulwark",
    type: "shield",
    description: "Radiant shield favoured by capital guardians.",
    value: 260,
  },
  "scout-mail": {
    id: "scout-mail",
    name: "Scout's Mail",
    type: "armor",
    description: "Light armour that bolsters stamina recovery.",
    value: 140,
  },
  "midnight-plate": {
    id: "midnight-plate",
    name: "Midnight Plate",
    type: "armor",
    description: "Heavy set that shrugs off even eldritch claws.",
    value: 295,
  },
  "medal-valor": {
    id: "medal-valor",
    name: "Medal of Valor",
    type: "medal",
    description: "Proof of courage – traders pay handsomely.",
    value: 90,
  },
  "sunken-medal": {
    id: "sunken-medal",
    name: "Sunken Medal",
    type: "medal",
    description: "Recovered from the Abyssal Archive ruins.",
    value: 160,
  },
  "wyrm-heart": {
    id: "wyrm-heart",
    name: "Wyrm Heart Relic",
    type: "relic",
    description: "Still pulsating core of the Stormwyrm tyrant.",
    value: 450,
  },
};

const createLocations = (): Location[] => [
  {
    id: "aurora-bastion",
    name: "Aurora Bastion",
    type: "city",
    position: { x: 1050, y: 780 },
    size: { width: 420, height: 360 },
    description: "Capital city – home to bustling markets and your estate.",
  },
  {
    id: "player-house",
    name: "Your Manor",
    type: "house",
    position: { x: 1180, y: 860 },
    size: { width: 160, height: 120 },
    description: "Safe haven to restock between expeditions.",
  },
  {
    id: "sunspire-crossing",
    name: "Sunspire Crossing",
    type: "city",
    position: { x: 420, y: 360 },
    size: { width: 280, height: 260 },
    description: "Trade town bridging the northern plains.",
  },
  {
    id: "emberfall",
    name: "Emberfall Refuge",
    type: "city",
    position: { x: 1760, y: 420 },
    size: { width: 260, height: 220 },
    description: "Mining hub wrapped around volcanic vents.",
  },
  {
    id: "glacier-hold",
    name: "Glacier Hold",
    type: "city",
    position: { x: 520, y: 1320 },
    size: { width: 300, height: 260 },
    description: "Frost-bitten stronghold guarding the south.",
  },
  {
    id: "obsidian-depths",
    name: "Obsidian Depths",
    type: "dungeon",
    position: { x: 360, y: 720 },
    size: { width: 220, height: 200 },
    description: "Molten tunnels riddled with cultists.",
  },
  {
    id: "skyreach-vault",
    name: "Skyreach Vault",
    type: "dungeon",
    position: { x: 1920, y: 1040 },
    size: { width: 220, height: 180 },
    description: "Floating sanctum of the Stormwyrm.",
  },
  {
    id: "umbral-wood",
    name: "Umbral Wood",
    type: "dungeon",
    position: { x: 1080, y: 320 },
    size: { width: 240, height: 200 },
    description: "Nightbound forest prowled by wraith packs.",
  },
  {
    id: "abyssal-archive",
    name: "Abyssal Archive",
    type: "dungeon",
    position: { x: 880, y: 1380 },
    size: { width: 240, height: 220 },
    description: "Sunken library hoarding forbidden relics.",
  },
  {
    id: "crystal-chasm",
    name: "Crystal Chasm",
    type: "dungeon",
    position: { x: 1520, y: 1320 },
    size: { width: 260, height: 220 },
    description: "Jagged cavern thrumming with volatile energy.",
  },
];

const createChests = (): Chest[] => [
  {
    id: "chest-aurora-market",
    position: { x: 1200, y: 900 },
    lootTable: ["ember-blade", "ironward-shield", "medal-valor"],
    gold: 120,
    opened: false,
  },
  {
    id: "chest-umbral",
    position: { x: 1140, y: 360 },
    lootTable: ["scout-mail", "medal-valor"],
    gold: 90,
    opened: false,
  },
  {
    id: "chest-obsidian",
    position: { x: 420, y: 760 },
    lootTable: ["frost-bow", "sunken-medal"],
    gold: 150,
    opened: false,
  },
  {
    id: "chest-crystal",
    position: { x: 1600, y: 1360 },
    lootTable: ["dawning-bulwark", "midnight-plate"],
    gold: 210,
    opened: false,
  },
  {
    id: "chest-glacier",
    position: { x: 560, y: 1360 },
    lootTable: ["medal-valor", "scout-mail"],
    gold: 80,
    opened: false,
  },
];

const spawnEnemies = (): Enemy[] => [
  {
    id: "mob-1",
    name: "Cult Blade",
    position: { x: 420, y: 720 },
    hp: 65,
    maxHp: 65,
    type: "mob",
    damage: 8,
    gold: 24,
    elixir: 1,
    lootTable: ["medal-valor"],
  },
  {
    id: "mob-2",
    name: "Wraith Stalker",
    position: { x: 1100, y: 360 },
    hp: 60,
    maxHp: 60,
    type: "mob",
    damage: 7,
    gold: 18,
    elixir: 1,
    lootTable: [],
  },
  {
    id: "mob-3",
    name: "Crystalline Horror",
    position: { x: 1560, y: 1340 },
    hp: 70,
    maxHp: 70,
    type: "mob",
    damage: 9,
    gold: 32,
    elixir: 2,
    lootTable: ["sunken-medal"],
  },
  {
    id: "boss-1",
    name: "Stormwyrm Tyrant",
    position: { x: 1960, y: 1080 },
    hp: 260,
    maxHp: 260,
    type: "boss",
    damage: 18,
    gold: 240,
    elixir: 4,
    lootTable: ["volt-lance", "wyrm-heart"],
  },
  {
    id: "boss-2",
    name: "Archivist Prime",
    position: { x: 940, y: 1400 },
    hp: 220,
    maxHp: 220,
    type: "boss",
    damage: 16,
    gold: 180,
    elixir: 3,
    lootTable: ["midnight-plate", "sunken-medal"],
  },
];

const calculateCamera = (position: Vector): Vector => ({
  x: position.x - VIEWPORT_SIZE.width / 2,
  y: position.y - VIEWPORT_SIZE.height / 2,
});

const clampCamera = (camera: Vector) => ({
  x: Math.max(0, Math.min(WORLD_SIZE.width - VIEWPORT_SIZE.width, camera.x)),
  y: Math.max(0, Math.min(WORLD_SIZE.height - VIEWPORT_SIZE.height, camera.y)),
});

const addLootToInventory = (inventory: Record<string, number>, loot: string[]) => {
  const updated = { ...inventory };
  loot.forEach((itemId) => {
    if (!ITEM_LIBRARY[itemId]) return;
    updated[itemId] = (updated[itemId] ?? 0) + 1;
  });
  return updated;
};

const resetState = () => ({
  tick: 0,
  pointer: { x: 1180, y: 920 },
  input: { x: 0, y: 0 },
  projectiles: [] as Projectile[],
  enemies: spawnEnemies(),
  player: {
    position: { x: 1180, y: 920 },
    velocity: { x: 0, y: 0 },
  },
  stats: { ...defaultStats },
  phase: "menu" as GamePhase,
  locations: createLocations(),
  chests: createChests(),
  inventory: {},
  gold: 0,
  elixirs: 0,
  camera: clampCamera(calculateCamera({ x: 1180, y: 920 })),
});

export const useGameStore = create<GameState>((set, get) => ({
  ...resetState(),
  skillNodes: [],
  setSkillNodes: (nodes) => set({ skillNodes: nodes }),
  setInput: (next) =>
    set((state) => ({
      input: next.movement ? next.movement : state.input,
      pointer: next.pointer ? next.pointer : state.pointer,
    })),
  fire: () =>
    set((state) => {
      if (state.phase !== "playing") {
        return {};
      }
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
            speed: 360,
            lifetime: 1.3,
          },
        ],
      };
    }),
  step: (dt) => {
    set((state) => {
      if (state.phase !== "playing") {
        return state;
      }

      const player = { ...state.player };
      const input = clampMagnitude(state.input, 1);
      const speed = state.stats.moveSpeed * 60;
      player.velocity.x = input.x * speed;
      player.velocity.y = input.y * speed;
      player.position.x = Math.max(
        48,
        Math.min(WORLD_SIZE.width - 48, player.position.x + player.velocity.x * dt),
      );
      player.position.y = Math.max(
        48,
        Math.min(WORLD_SIZE.height - 48, player.position.y + player.velocity.y * dt),
      );

      const projectiles = state.projectiles
        .map((projectile) => ({
          ...projectile,
          position: {
            x: projectile.position.x + projectile.direction.x * projectile.speed * dt,
            y: projectile.position.y + projectile.direction.y * projectile.speed * dt,
          },
          lifetime: projectile.lifetime - dt,
        }))
        .filter((projectile) =>
          projectile.lifetime > 0 &&
          projectile.position.x >= 0 &&
          projectile.position.x <= WORLD_SIZE.width &&
          projectile.position.y >= 0 &&
          projectile.position.y <= WORLD_SIZE.height,
        );

      const movedEnemies = state.enemies.map((enemy) => {
        if (enemy.hp <= 0) {
          return enemy;
        }
        const direction = normalize({
          x: player.position.x - enemy.position.x,
          y: player.position.y - enemy.position.y,
        });
        const chaseSpeed = enemy.type === "boss" ? 80 : 120;
        const nextPosition = {
          x: enemy.position.x + direction.x * chaseSpeed * dt,
          y: enemy.position.y + direction.y * chaseSpeed * dt,
        };
        return {
          ...enemy,
          position: {
            x: Math.max(32, Math.min(WORLD_SIZE.width - 32, nextPosition.x)),
            y: Math.max(32, Math.min(WORLD_SIZE.height - 32, nextPosition.y)),
          },
        };
      });

      const lootCollected: string[] = [];
      let goldEarned = 0;
      let elixirsEarned = 0;

      const activeProjectiles = [...projectiles];
      const survivors: Enemy[] = [];

      for (const enemy of movedEnemies) {
        let remainingHp = enemy.hp;
        if (remainingHp > 0) {
          for (const projectile of activeProjectiles) {
            if (projectile.lifetime <= 0) {
              continue;
            }
            const dist = magnitude({
              x: projectile.position.x - enemy.position.x,
              y: projectile.position.y - enemy.position.y,
            });
            const hitRadius = enemy.type === "boss" ? 36 : 26;
            if (dist < hitRadius) {
              remainingHp -= 20 + state.stats.firePower * 0.25;
              projectile.lifetime = 0;
            }
          }
        }

        if (remainingHp > 0) {
          survivors.push({ ...enemy, hp: remainingHp });
        } else if (enemy.hp > 0) {
          goldEarned += enemy.gold;
          elixirsEarned += enemy.elixir;
          lootCollected.push(...enemy.lootTable);
        }
      }

      const aliveProjectiles = activeProjectiles.filter((p) => p.lifetime > 0);

      const chests = state.chests.map((chest) => {
        if (chest.opened) {
          return chest;
        }
        const dist = magnitude({
          x: chest.position.x - player.position.x,
          y: chest.position.y - player.position.y,
        });
        if (dist < 64) {
          lootCollected.push(...chest.lootTable);
          goldEarned += chest.gold;
          return { ...chest, opened: true };
        }
        return chest;
      });

      const camera = clampCamera(calculateCamera(player.position));

      const staminaDrain = magnitude(input) * 15 * dt;
      const staminaRegen = 10 * dt;
      const nextStamina = Math.max(
        0,
        Math.min(120, state.stats.stamina - staminaDrain + staminaRegen),
      );

      return {
        tick: state.tick + 1,
        player,
        projectiles: aliveProjectiles,
        enemies: survivors,
        stats: { ...state.stats, stamina: nextStamina },
        chests,
        gold: state.gold + goldEarned,
        elixirs: state.elixirs + elixirsEarned,
        inventory: addLootToInventory(state.inventory, lootCollected),
        camera,
      };
    });
  },
  startGame: () => {
    const fresh = resetState();
    set({
      ...fresh,
      phase: "playing",
      skillNodes: get().skillNodes,
    });
  },
}));
