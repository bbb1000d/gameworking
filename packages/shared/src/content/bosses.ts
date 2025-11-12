import type { BossDefinition } from "../types";

export const bosses: BossDefinition[] = [
  {
    key: "ember-colossus",
    name: "Ember Colossus",
    element: "Fire",
    description: "Launches lava waves and meteor rings across the arena.",
    phases: 3,
    unlockKey: "Molten Core",
    uniqueDrop: "molten-core",
  },
  {
    key: "frost-matriarch",
    name: "Frost Matriarch",
    element: "Ice",
    description: "Controls ice mirrors and freezing shatter phases.",
    phases: 3,
    unlockKey: "Glacier Heart",
    uniqueDrop: "glacier-heart",
  },
  {
    key: "storm-warden",
    name: "Storm Warden",
    element: "Volt",
    description: "Pylons charge rotating arcs of lightning.",
    phases: 3,
    unlockKey: "Capacitor Spine",
    uniqueDrop: "capacitor-spine",
  },
  {
    key: "clockwork-tyrant",
    name: "Clockwork Tyrant",
    element: "Clockwork",
    description: "Rewinds time with bullet-hell gear barrages.",
    phases: 3,
    unlockKey: "Temporal Key",
    uniqueDrop: "temporal-key",
  },
  {
    key: "hive-sovereign",
    name: "Hive Sovereign",
    element: "Poison",
    description: "Summons swarms and pools of venomous acid.",
    phases: 3,
    unlockKey: "Royal Jelly",
    uniqueDrop: "royal-jelly",
  },
  {
    key: "null-seraph",
    name: "Null Seraph",
    element: "Void",
    description: "Splits arena with invulnerability and pattern checks.",
    phases: 3,
    unlockKey: "Void Feather",
    uniqueDrop: "void-feather",
  },
];

export default bosses;
