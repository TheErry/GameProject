import { createContext, useContext, useRef } from "react";
import { Rect } from "../types";

type ObstacleItem = { id: string; rect: Rect };

type CollisionContextValue = {
  obstaclesRef: React.RefObject<Map<string, ObstacleItem>>;
  registerObstacle: (id: string, rect: Rect) => void;
  updateObstacle: (id: string, rect: Rect) => void;
  unregisterObstacle: (id: string) => void;
}

const CollisionContext = createContext<CollisionContextValue | null>(null)

export function CollisionProvider({ children }: { children: React.ReactNode }) {
  const obstaclesRef = useRef<Map<string, ObstacleItem>>(new Map());

  const registerObstacle = (id: string, rect: Rect) => {
    obstaclesRef.current.set(id, { id, rect });
  }

  const updateObstacle = (id: string, rect: Rect) => {
    const existing = obstaclesRef.current.get(id);
    obstaclesRef.current.set(id, { id, rect:rect ?? existing?.rect })
  }
  const unregisterObstacle = (id: string) => {
    obstaclesRef.current.delete(id);
  }

  return (
    <CollisionContext.Provider value={{ obstaclesRef, registerObstacle, updateObstacle, unregisterObstacle }}>
      {children}
    </CollisionContext.Provider>
  )
}

export function useCollision() {
  const context = useContext(CollisionContext);
  if (!context) throw new Error("useCollision must be used within a CollisionProvider");
  return context;
}