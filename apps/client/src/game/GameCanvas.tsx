import { Stage, Container, Graphics, Text } from "@pixi/react";
import { useEffect } from "react";
import { useGameStore } from "../state/useGameStore";
import { useInput } from "./useInput";
import { useTicker } from "./useTicker";

const WIDTH = 960;
const HEIGHT = 540;

export function GameCanvas() {
  const state = useGameStore();
  useInput();
  useTicker();

  useEffect(() => {
    const handleResize = () => {
      const root = document.getElementById("root");
      if (!root) return;
      root.style.setProperty("--canvas-width", `${WIDTH}px`);
      root.style.setProperty("--canvas-height", `${HEIGHT}px`);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative" }}>
        <Stage
          width={WIDTH}
          height={HEIGHT}
          options={{ background: 0x080b12, antialias: true }}
          raf={false}
          renderOnComponentChange
        >
          <Container>
            <Graphics
              draw={(g) => {
                g.clear();
                g.beginFill(0x1d2435);
                g.drawRoundedRect(0, 0, WIDTH, HEIGHT, 16);
                g.endFill();
              }}
            />
            <Graphics
              draw={(g) => {
                g.clear();
                g.beginFill(0x4ac6ff);
                g.drawCircle(state.player.position.x, state.player.position.y, 16);
                g.endFill();
              }}
            />
            {state.projectiles.map((projectile) => (
              <Graphics
                key={projectile.id}
                draw={(g) => {
                  g.clear();
                  g.beginFill(0xffe066);
                  g.drawCircle(projectile.position.x, projectile.position.y, 6);
                  g.endFill();
                }}
              />
            ))}
            {state.enemies.map((enemy) => (
              <Graphics
                key={enemy.id}
                draw={(g) => {
                  g.clear();
                  g.beginFill(0xff5b5b);
                  g.drawRect(enemy.position.x - 12, enemy.position.y - 12, 24, 24);
                  g.endFill();
                }}
              />
            ))}
            <Graphics
              draw={(g) => {
                g.clear();
                g.lineStyle(2, 0xffffff, 0.5);
                g.moveTo(state.player.position.x, state.player.position.y);
                g.lineTo(state.pointer.x, state.pointer.y);
              }}
            />
            <Text text={`T${state.tick}`} x={20} y={HEIGHT - 32} style={{ fill: 0xffffff, fontSize: 16 }} />
          </Container>
        </Stage>
        <div className="hud">
          <div>
            HP
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.max(0, Math.min(1, state.stats.hp / 120)) * 100}%` }}
              />
            </div>
          </div>
          <div>
            Shield
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.max(0, Math.min(1, state.stats.shield / 40)) * 100}%`, background: "#63e6be" }}
              />
            </div>
          </div>
          <div>
            Stamina
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.max(0, Math.min(1, state.stats.stamina / 120)) * 100}%`, background: "#ffd43b" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
