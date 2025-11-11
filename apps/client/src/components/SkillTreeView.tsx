import { useMemo } from "react";
import { useGameStore } from "../state/useGameStore";

const pathColours: Record<string, string> = {
  Offense: "#ff6b6b",
  Control: "#4dabf7",
  Survivability: "#63e6be",
  Utility: "#ffd43b",
};

export const SkillTreeView = () => {
  const nodes = useGameStore((state) => state.skillNodes);

  const grouped = useMemo(() => {
    return nodes.reduce<Record<string, typeof nodes>>((acc, node) => {
      acc[node.path] = acc[node.path] ?? [];
      acc[node.path]!.push(node);
      return acc;
    }, {});
  }, [nodes]);

  return (
    <section>
      <h2>Skill Tree</h2>
      <p>
        Allocate nodes after earning boss sigils. Each node displays per-rank bonuses following the shared stats schema.
      </p>
      {Object.entries(grouped).map(([path, list]) => (
        <div key={path} style={{ borderLeft: `4px solid ${pathColours[path] ?? "#adb5bd"}`, paddingLeft: "0.75rem" }}>
          <h3>{path}</h3>
          <ul>
            {list.map((node) => (
              <li key={node.key}>
                <strong>{node.key.replace(/-/g, " ")}</strong> (Max rank {node.maxRank})
                {node.gateUnlockKey ? <em> — Gate: {node.gateUnlockKey}</em> : null}
                <div>{node.description}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};
