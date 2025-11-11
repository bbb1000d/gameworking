import type { Stats } from "@rogue/shared";
import { useGameStore } from "../state/useGameStore";

type Props = {
  baseStats: Stats;
};

const statLabels: (keyof Stats)[] = [
  "hp",
  "shield",
  "stamina",
  "moveSpeed",
  "fireRate",
  "reload",
  "critChance",
  "critDamage",
  "firePower",
  "icePower",
  "voltPower",
  "dashCharges",
  "cdr",
];

export const StatSummary = ({ baseStats }: Props) => {
  const stats = useGameStore((state) => state.stats);
  return (
    <section>
      <h2>Stats</h2>
      <ul>
        {statLabels.map((label) => (
          <li key={label}>
            <strong>{label}</strong>: {stats[label].toFixed(2)}
            <span style={{ opacity: 0.6 }}> (base {baseStats[label].toFixed(2)})</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
