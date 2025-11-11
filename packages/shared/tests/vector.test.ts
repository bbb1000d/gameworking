import { describe, expect, it } from "vitest";
import { add, clampMagnitude, magnitude, normalize } from "../src/math/vector";

describe("vector math", () => {
  it("adds vectors", () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
  });

  it("normalizes vectors", () => {
    expect(normalize({ x: 3, y: 4 })).toEqual({ x: 0.6, y: 0.8 });
  });

  it("clamps magnitude", () => {
    const clamped = clampMagnitude({ x: 3, y: 4 }, 2);
    expect(magnitude(clamped)).toBeCloseTo(2, 4);
  });
});
