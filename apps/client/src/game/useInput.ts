import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

const KEY_MAP: Record<string, { x: number; y: number }> = {
  w: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  s: { x: 0, y: 1 },
  d: { x: 1, y: 0 },
};

export const useInput = () => {
  const setInput = useGameStore((state) => state.setInput);
  const fire = useGameStore((state) => state.fire);

  useEffect(() => {
    const pressed = new Set<string>();

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (KEY_MAP[key]) {
        pressed.add(key);
        updateInput();
      }
      if (key === " ") {
        fire();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (KEY_MAP[key]) {
        pressed.delete(key);
        updateInput();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      setInput({
        pointer: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      });
    };

    const handleMouseDown = () => fire();

    const updateInput = () => {
      let x = 0;
      let y = 0;
      pressed.forEach((key) => {
        const vector = KEY_MAP[key];
        x += vector.x;
        y += vector.y;
      });
      setInput({ movement: { x, y } });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [fire, setInput]);
};
