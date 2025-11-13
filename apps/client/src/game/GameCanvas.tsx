import { Stage, Container, Graphics, Text } from "@pixi/react";
import { Fragment, useEffect, useMemo } from "react";
import {
  VIEWPORT_SIZE,
  WORLD_SIZE,
  useGameStore,
} from "../state/useGameStore";
import { useInput } from "./useInput";
import { useTicker } from "./useTicker";

const WIDTH = VIEWPORT_SIZE.width;
const HEIGHT = VIEWPORT_SIZE.height;

export function GameCanvas() {
  const state = useGameStore();
  const startGame = useGameStore((value) => value.startGame);
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

  const camera = state.camera;

  const pointerScreen = useMemo(
    () => ({ x: state.pointer.x - camera.x, y: state.pointer.y - camera.y }),
    [camera.x, camera.y, state.pointer.x, state.pointer.y],
  );

  const renderLocations = state.locations.map((location) => (
    <Graphics
      key={location.id}
      draw={(g) => {
        g.clear();
        const baseX = location.position.x - camera.x - location.size.width / 2;
        const baseY = location.position.y - camera.y - location.size.height / 2;
        const color =
          location.type === "city"
            ? 0x274060
            : location.type === "house"
            ? 0x345f4f
            : 0x422e5a;
        g.beginFill(color, 0.9);
        g.drawRoundedRect(baseX, baseY, location.size.width, location.size.height, 18);
        g.endFill();
        g.lineStyle(2, 0xffffff, 0.15);
        g.drawRoundedRect(baseX, baseY, location.size.width, location.size.height, 18);
      }}
    />
  ));

  const renderLocationLabels = state.locations.map((location) => (
    <Text
      key={`${location.id}-label`}
      text={location.name}
      x={location.position.x - camera.x - location.size.width / 2 + 12}
      y={location.position.y - camera.y - location.size.height / 2 + 8}
      style={{ fill: 0xbcd4ff, fontSize: 14 }}
    />
  ));

  const renderChests = state.chests.map((chest) => (
    <Graphics
      key={chest.id}
      draw={(g) => {
        g.clear();
        const color = chest.opened ? 0x85663d : 0xc4923d;
        g.beginFill(color);
        g.drawRoundedRect(chest.position.x - camera.x - 16, chest.position.y - camera.y - 12, 32, 24, 6);
        g.endFill();
        g.lineStyle(2, 0xffffff, chest.opened ? 0.1 : 0.25);
        g.drawRoundedRect(chest.position.x - camera.x - 16, chest.position.y - camera.y - 12, 32, 24, 6);
      }}
    />
  ));

  const renderEnemies = state.enemies.map((enemy) => (
    <Fragment key={enemy.id}>
      <Graphics
        draw={(g) => {
          g.clear();
          const fill = enemy.type === "boss" ? 0xd9480f : 0xff5b5b;
          const size = enemy.type === "boss" ? 40 : 26;
          g.beginFill(fill);
          g.drawCircle(enemy.position.x - camera.x, enemy.position.y - camera.y, size / 2);
          g.endFill();
          g.lineStyle(2, 0xffffff, 0.35);
          g.drawCircle(enemy.position.x - camera.x, enemy.position.y - camera.y, size / 2);
        }}
      />
      <Graphics
        draw={(g) => {
          g.clear();
          const barWidth = 48;
          const percentage = Math.max(0, enemy.hp) / enemy.maxHp;
          const screenX = enemy.position.x - camera.x - barWidth / 2;
          const screenY = enemy.position.y - camera.y - (enemy.type === "boss" ? 40 : 32);
          g.beginFill(0x000000, 0.5);
          g.drawRoundedRect(screenX, screenY, barWidth, 6, 3);
          g.endFill();
          g.beginFill(0xfa5252);
          g.drawRoundedRect(screenX + 1, screenY + 1, (barWidth - 2) * percentage, 4, 2);
          g.endFill();
        }}
      />
      <Text
        text={enemy.name}
        x={enemy.position.x - camera.x - 40}
        y={enemy.position.y - camera.y - (enemy.type === "boss" ? 56 : 44)}
        style={{ fill: 0xffe3b3, fontSize: enemy.type === "boss" ? 16 : 13 }}
      />
    </Fragment>
  ));

  return (
    <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative" }} id="game-stage">
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
                g.beginFill(0x101725);
                g.drawRect(-state.camera.x, -state.camera.y, WORLD_SIZE.width, WORLD_SIZE.height);
                g.endFill();
              }}
            />
            <Graphics
              draw={(g) => {
                g.clear();
                g.lineStyle(3, 0x1f2d3d, 0.85);
                g.drawRect(-state.camera.x, -state.camera.y, WORLD_SIZE.width, WORLD_SIZE.height);
              }}
            />
            {renderLocations}
            {renderChests}
            <Graphics
              draw={(g) => {
                g.clear();
                g.beginFill(0x4ac6ff);
                g.drawCircle(state.player.position.x - camera.x, state.player.position.y - camera.y, 16);
                g.endFill();
                g.lineStyle(2, 0xffffff, 0.5);
                g.drawCircle(state.player.position.x - camera.x, state.player.position.y - camera.y, 16);
              }}
            />
            {state.projectiles.map((projectile) => (
              <Graphics
                key={projectile.id}
                draw={(g) => {
                  g.clear();
                  g.beginFill(0xffe066);
                  g.drawCircle(projectile.position.x - camera.x, projectile.position.y - camera.y, 6);
                  g.endFill();
                }}
              />
            ))}
            {renderEnemies}
            <Graphics
              draw={(g) => {
                g.clear();
                g.lineStyle(2, 0xffffff, 0.35);
                g.moveTo(state.player.position.x - camera.x, state.player.position.y - camera.y);
                g.lineTo(pointerScreen.x, pointerScreen.y);
              }}
            />
            {renderLocationLabels}
            <Text text={`Tick ${state.tick}`} x={20} y={HEIGHT - 32} style={{ fill: 0xffffff, fontSize: 16 }} />
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
        {state.phase === "menu" && (
          <div className="menu-overlay">
            <div className="menu-panel">
              <h2>World Expedition</h2>
              <p>
                Explore the expanded realms, reclaim treasures from forgotten dungeons, and defend Aurora
                Bastion.
              </p>
              <button onClick={startGame}>Play</button>
              <p className="menu-hint">WASD to move • Click to fire • Approach chests to loot them</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
