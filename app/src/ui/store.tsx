import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_PARAMS, engine, FxParams } from '../audio/engine';

interface Store {
  params: FxParams;
  set: (patch: Partial<FxParams>) => void;
  live: boolean;
  error: string | null;
  toggleLive: () => Promise<void>;
  level: number;
}

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [params, setParams] = useState<FxParams>(DEFAULT_PARAMS);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const set = useCallback((patch: Partial<FxParams>) => {
    setParams((p) => ({ ...p, ...patch }));
    if (engine.running) engine.update(patch);
  }, []);

  const toggleLive = useCallback(async () => {
    setError(null);
    if (engine.running) {
      await engine.stop();
      setLive(false);
      setLevel(0);
      return;
    }
    try {
      await engine.start(paramsRef.current);
      setLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLive(false);
    }
  }, []);

  // `muted` only silences the mic; the engine keeps running.
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setLevel(engine.level()), 80);
    return () => clearInterval(id);
  }, [live]);

  return (
    <Ctx.Provider value={{ params, set, live, error, toggleLive, level }}>{children}</Ctx.Provider>
  );
}
