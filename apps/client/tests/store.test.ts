import { describe, expect, it } from "vitest";
import { useGameStore } from "../src/state/useGameStore";

describe("game store", () => {
  it("fires projectiles and drains stamina", () => {
    const initial = useGameStore.getState();
    expect(initial.projectiles).toHaveLength(0);
    useGameStore.getState().fire();
    expect(useGameStore.getState().projectiles.length).toBe(1);
    useGameStore.getState().setInput({ movement: { x: 1, y: 0 } });
    useGameStore.getState().step(1 / 60);
    expect(useGameStore.getState().stats.stamina).toBeLessThan(initial.stats.stamina);
  });
});
