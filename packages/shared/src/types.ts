export type Stats = {
  hp: number;
  shield: number;
  stamina: number;
  moveSpeed: number;
  fireRate: number;
  reload: number;
  critChance: number;
  critDamage: number;
  firePower: number;
  icePower: number;
  voltPower: number;
  dashCharges: number;
  cdr: number;
};

export type SkillNodePath = "Offense" | "Control" | "Survivability" | "Utility";

export type SkillRequirement = {
  nodeKey: string;
  rank: number;
};

export type SkillNode = {
  id: string;
  key: string;
  path: SkillNodePath;
  maxRank: number;
  description: string;
  requires: SkillRequirement[];
  perRank: Partial<Stats> & { notes?: string };
  synergies?: string[];
  gateUnlockKey?: string;
};

export type DropRarity = "Common" | "Rare" | "Epic" | "Legendary";

export type Drop = {
  itemKey: string;
  rarity: DropRarity;
  affixes: Record<string, number>;
};

export type BossDefinition = {
  key: string;
  name: string;
  element: "Fire" | "Ice" | "Volt" | "Clockwork" | "Poison" | "Void";
  description: string;
  phases: number;
  unlockKey: string;
  uniqueDrop: string;
};

export type DungeonModifier = {
  key: string;
  name: string;
  description: string;
  effect: string;
};

export type DungeonRoomTemplate = {
  key: string;
  theme: string;
  category: "combat" | "puzzle" | "shop" | "event" | "boss" | "secret";
  hazardTags: string[];
  weight: number;
};

export type SeededRunConfig = {
  tier: number;
  seed: string;
  modifiers: DungeonModifier[];
};
