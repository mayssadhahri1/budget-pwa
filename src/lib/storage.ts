// Sauvegarde locale dans le navigateur (l'application fonctionne hors ligne)
import { useEffect, useState } from 'react';

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial; // données corrompues ou stockage bloqué
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // stockage plein ou mode privé : on ignore, l'application reste utilisable
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// Identifiant unique, avec repli si crypto.randomUUID n'existe pas (anciens navigateurs)
export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
