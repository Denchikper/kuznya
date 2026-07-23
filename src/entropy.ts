// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

import type { GenerateOptions, HeatLevel } from "./types";
import { buildAlphabet } from "./api";

/** Энтропия в битах: length × log2(размер алфавита). */
export function entropyBits(opts: GenerateOptions): number {
  const alphabet = buildAlphabet(opts);
  if (alphabet.length === 0) return 0;
  return opts.length * Math.log2(alphabet.length);
}

/** Стадия нагрева по битам энтропии. */
export function heatLevel(bits: number): HeatLevel {
  if (bits < 45) return "cold";
  if (bits < 70) return "warming";
  if (bits < 100) return "forging";
  return "white-hot";
}

export const HEAT_LABELS: Record<HeatLevel, string> = {
  cold: "Холодный металл",
  warming: "Прогрев",
  forging: "Ковка",
  "white-hot": "Белое каление",
};

/** Заполнение шкалы: 128 бит считаем полным нагревом. */
export function heatFraction(bits: number): number {
  return Math.min(bits / 128, 1);
}
