"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "edumatch:local-list";

function read(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Device-local list (comparison and favourites in Stage 1).
 * Stage 2 replaces storage with MongoDB collections (comparison lists, favourites).
 */
export function useLocalList(key: string, max = Infinity) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setItems(read(key));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  const write = useCallback(
    (next: string[]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage unavailable (private mode) – ignore */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );

  const has = useCallback((id: string) => items.includes(id), [items]);
  const add = useCallback(
    (id: string) => {
      const current = read(key);
      if (current.includes(id) || current.length >= max) return false;
      write([...current, id]);
      return true;
    },
    [key, max, write],
  );
  const remove = useCallback((id: string) => write(read(key).filter((x) => x !== id)), [key, write]);
  const toggle = useCallback((id: string) => (read(key).includes(id) ? (remove(id), true) : add(id)), [key, add, remove]);

  return { items, has, add, remove, toggle, isFull: items.length >= max };
}

export const COMPARE_KEY = "edumatch.compare";
export const FAVOURITES_KEY = "edumatch.favourites";
export const MAX_COMPARE = 4;
