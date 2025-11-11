import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";

const FIXED_DT = 1 / 60;

export const useTicker = () => {
  const step = useGameStore((state) => state.step);

  useEffect(() => {
    let last = performance.now();
    let accumulator = 0;
    let rafId = 0;

    const loop = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      accumulator += delta;

      while (accumulator >= FIXED_DT) {
        step(FIXED_DT);
        accumulator -= FIXED_DT;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [step]);
};
