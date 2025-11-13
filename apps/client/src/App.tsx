import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { bosses, skillTree, type Stats } from "@rogue/shared";
import { GameCanvas } from "./game/GameCanvas";
import { useGameStore } from "./state/useGameStore";
import { SkillTreeView } from "./components/SkillTreeView";
import { StatSummary } from "./components/StatSummary";
import { InventoryPanel } from "./components/InventoryPanel";

const baseStats: Stats = {
  hp: 100,
  shield: 40,
  stamina: 100,
  moveSpeed: 5,
  fireRate: 1,
  reload: 1,
  critChance: 5,
  critDamage: 150,
  firePower: 0,
  icePower: 0,
  voltPower: 0,
  dashCharges: 1,
  cdr: 0,
};

const fetchSkillTree = async () => {
  const response = await fetch("/api/skill-tree", {
    credentials: "include",
  });
  if (!response.ok) {
    return { nodes: skillTree };
  }
  return response.json();
};

export default function App() {
  const { data } = useQuery({
    queryKey: ["skill-tree"],
    queryFn: fetchSkillTree,
    initialData: { nodes: skillTree },
  });

  const setSkillNodes = useGameStore((state) => state.setSkillNodes);
  const gold = useGameStore((state) => state.gold);
  const elixirs = useGameStore((state) => state.elixirs);
  const locations = useGameStore((state) => state.locations);

  useEffect(() => {
    setSkillNodes(data.nodes);
  }, [data, setSkillNodes]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Rogue Tier</h1>
        <p>Top-down action roguelite prototype showcasing ECS-based combat.</p>
        <StatSummary baseStats={baseStats} />
        <SkillTreeView />
        <section>
          <h2>Adventurer Ledger</h2>
          <p>
            <strong>Gold:</strong> {gold}
          </p>
          <p>
            <strong>Elixirs:</strong> {elixirs}
          </p>
        </section>
        <section>
          <h2>Inventory</h2>
          <InventoryPanel />
        </section>
        <section>
          <h2>World Atlas</h2>
          <ul className="location-list">
            {locations.map((location) => (
              <li key={location.id}>
                <strong>{location.name}</strong>
                {location.description ? ` — ${location.description}` : ""}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Boss Unlocks</h2>
          <ul>
            {bosses.map((boss) => (
              <li key={boss.key}>
                <strong>{boss.name}</strong> — {boss.uniqueDrop}
              </li>
            ))}
          </ul>
        </section>
      </aside>
      <main className="content">
        <GameCanvas />
      </main>
    </div>
  );
}
