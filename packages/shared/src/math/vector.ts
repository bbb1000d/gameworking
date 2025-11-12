export type Vec2 = { x: number; y: number };

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const subtract = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const multiply = (a: Vec2, scalar: number): Vec2 => ({
  x: a.x * scalar,
  y: a.y * scalar,
});

export const magnitude = (a: Vec2): number => Math.hypot(a.x, a.y);

export const normalize = (a: Vec2): Vec2 => {
  const mag = magnitude(a);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: a.x / mag, y: a.y / mag };
};

export const clampMagnitude = (a: Vec2, max: number): Vec2 => {
  const mag = magnitude(a);
  if (mag <= max) return { ...a };
  return multiply(normalize(a), max);
};
