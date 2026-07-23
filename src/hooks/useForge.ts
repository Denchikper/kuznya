// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

import { useCallback, useEffect, useRef, useState } from "react";
import { buildAlphabet, generatePassword } from "../api";
import type { GenerateOptions } from "../types";

const FORGE_MS = 600; // длительность «проковки»
const TICK_MS = 34; // шаг перебора символов

/**
 * «Проковка»: после генерации символы перебираются и застывают слева направо.
 * При prefers-reduced-motion результат показывается сразу.
 */
export function useForge() {
  const [display, setDisplay] = useState("");
  const [forging, setForging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const forge = useCallback(
    async (opts: GenerateOptions) => {
      setError(null);
      let result: string;
      try {
        result = await generatePassword(opts);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return;
      }

      stop();
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        setDisplay(result);
        return;
      }

      const alphabet = buildAlphabet(opts) || result;
      const started = performance.now();
      setForging(true);

      timer.current = window.setInterval(() => {
        const progress = (performance.now() - started) / FORGE_MS;
        // Сколько символов уже «застыло» (слева направо).
        const locked = Math.floor(progress * result.length);
        if (locked >= result.length) {
          stop();
          setDisplay(result);
          setForging(false);
          return;
        }
        const molten = [...result]
          .map((c, i) =>
            i < locked
              ? c
              : alphabet[Math.floor(Math.random() * alphabet.length)],
          )
          .join("");
        setDisplay(molten);
      }, TICK_MS);
    },
    [stop],
  );

  return { display, forging, error, forge };
}
