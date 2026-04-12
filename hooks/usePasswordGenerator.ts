import { useState, useCallback } from "react";
import {
  Mode,
  RandomOptions,
  PassphraseOptions,
  generatePassword,
  getStrength,
  StrengthResult,
} from "@/lib/generator";

interface PasswordState {
  password: string;
  strength: StrengthResult | null;
  copied: boolean;
  mode: Mode;
  randomOpts: RandomOptions;
  passphraseOpts: PassphraseOptions;
}

const DEFAULT_RANDOM_OPTS: RandomOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: true,
  mustContain: false,
};

const DEFAULT_PASSPHRASE_OPTS: PassphraseOptions = {
  wordCount: 4,
};

export function usePasswordGenerator() {
  const [state, setState] = useState<PasswordState>({
    password: "",
    strength: null,
    copied: false,
    mode: "random",
    randomOpts: DEFAULT_RANDOM_OPTS,
    passphraseOpts: DEFAULT_PASSPHRASE_OPTS,
  });

  const generate = useCallback((overrideState?: Partial<PasswordState>) => {
    setState((prev) => {
      const merged = { ...prev, ...overrideState };
      const opts =
        merged.mode === "random"
          ? { mode: "random" as const, ...merged.randomOpts }
          : merged.mode === "pronounceable"
          ? { mode: "pronounceable" as const, length: merged.randomOpts.length }
          : { mode: "passphrase" as const, ...merged.passphraseOpts };

      const password = generatePassword(opts);
      const strength = getStrength(password);
      return { ...merged, password, strength, copied: false };
    });
  }, []);

  const setMode = useCallback(
    (mode: Mode) => {
      generate({ mode });
    },
    [generate]
  );

  const updateRandomOpts = useCallback(
    (patch: Partial<RandomOptions>) => {
      setState((prev) => {
        const activeCount = Object.entries({ ...prev.randomOpts, ...patch })
          .filter(([k, v]) => ["uppercase", "lowercase", "numbers", "symbols"].includes(k) && v)
          .length;
        if (activeCount === 0) return prev;
        return prev;
      });
      generate({
        randomOpts: state.randomOpts,
      });
      setState((prev) => {
        const next = { ...prev.randomOpts, ...patch };
        const activeCount = ["uppercase", "lowercase", "numbers", "symbols"].filter(
          (k) => next[k as keyof RandomOptions]
        ).length;
        if (activeCount === 0) return prev;
        return { ...prev, randomOpts: next };
      });
    },
    [generate, state.randomOpts]
  );

  const setRandomOpts = useCallback(
    (patch: Partial<RandomOptions>) => {
      setState((prev) => {
        const next = { ...prev.randomOpts, ...patch };
        const activeCount = ["uppercase", "lowercase", "numbers", "symbols"].filter(
          (k) => next[k as keyof RandomOptions]
        ).length;
        if (activeCount === 0) return prev;
        const opts =
          prev.mode === "random"
            ? { mode: "random" as const, ...next }
            : prev.mode === "pronounceable"
            ? { mode: "pronounceable" as const, length: next.length }
            : { mode: "passphrase" as const, ...prev.passphraseOpts };
        const password = generatePassword(opts);
        const strength = getStrength(password);
        return { ...prev, randomOpts: next, password, strength, copied: false };
      });
    },
    []
  );

  const setPassphraseOpts = useCallback((patch: Partial<PassphraseOptions>) => {
    setState((prev) => {
      const next = { ...prev.passphraseOpts, ...patch };
      const password = generatePassword({ mode: "passphrase", ...next });
      const strength = getStrength(password);
      return { ...prev, passphraseOpts: next, password, strength, copied: false };
    });
  }, []);

  const copy = useCallback(async (password: string) => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setState((prev) => ({ ...prev, copied: true }));
      setTimeout(() => setState((prev) => ({ ...prev, copied: false })), 1800);
    } catch {
      // fallback: select text
    }
  }, []);

  return {
    ...state,
    generate,
    setMode,
    setRandomOpts,
    setPassphraseOpts,
    copy,
  };
}