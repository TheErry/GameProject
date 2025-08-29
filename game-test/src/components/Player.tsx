import { useState, useEffect, useRef } from "react";

type Rect = { x: number; y: number; width: number; height: number };
type Vec2 = { x: number; y: number };

export default function Player() {
  const [pos, setPos] = useState<Vec2>({ x: 100, y: 100 });

  const keys = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  const SPEED = 250;
  const width = 1280;
  const height = 720;
  const playerSize = 50;

  const obstacle: Rect = { x: 300, y: 200, width: 120, height: 80 };

  const intersects = (a: Rect, b: Rect) =>
    !(a.x + a.width <= b.x ||
      a.x >= b.x + b.width ||
      a.y + a.height <= b.y ||
      a.y >= b.y + b.height);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const tick = (t: number) => {
      if (prevTimeRef.current == null) prevTimeRef.current = t;
      const dt = (t - prevTimeRef.current) / 1000;
      prevTimeRef.current = t;

      let dx = 0,
        dy = 0;
      const k = keys.current;
      if (k.has("ArrowLeft")) dx -= 1;
      if (k.has("ArrowRight")) dx += 1;
      if (k.has("ArrowUp")) dy -= 1;
      if (k.has("ArrowDown")) dy += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;

        setPos((p) => {
          // Calculate new position
          const newX = p.x + dx * SPEED * dt;
          const newY = p.y + dy * SPEED * dt;
          
          // Clamp to boundaries
          const clampedX = Math.max(0, Math.min(newX, width - playerSize));
          const clampedY = Math.max(0, Math.min(newY, height - playerSize));
          
          // Check collision with new position
          const newPlayerRect: Rect = { 
            x: clampedX, 
            y: clampedY, 
            width: playerSize, 
            height: playerSize 
          };
          
          if (intersects(newPlayerRect, obstacle)) {
            // Try moving only on X axis
            const xOnlyRect: Rect = { 
              x: clampedX, 
              y: p.y, 
              width: playerSize, 
              height: playerSize 
            };
            
            // Try moving only on Y axis
            const yOnlyRect: Rect = { 
              x: p.x, 
              y: clampedY, 
              width: playerSize, 
              height: playerSize 
            };
            
            // If X-only movement doesn't collide, allow it
            if (!intersects(xOnlyRect, obstacle)) {
              return { x: clampedX, y: p.y };
            }
            
            // If Y-only movement doesn't collide, allow it
            if (!intersects(yOnlyRect, obstacle)) {
              return { x: p.x, y: clampedY };
            }
            
            // If both directions collide, don't move
            return p;
          }
          
          // No collision, allow full movement
          return { x: clampedX, y: clampedY };
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      prevTimeRef.current = null;
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        background: "#eee",
      }}
    >
      {/* Player */}
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: playerSize,
          height: playerSize,
          background: "red",
        }}
      />
      {/* Obstacle */}
      <div
        style={{
          position: "absolute",
          left: obstacle.x,
          top: obstacle.y,
          width: obstacle.width,
          height: obstacle.height,
          background: "green",
        }}
      />
    </div>
  );
}
