// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { GenerateOptions } from "./types";

const inTauri = "__TAURI_INTERNALS__" in window;

export const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
} as const;

const SIMILAR = "lI1O0S5B8";

/** Алфавит по выбранным опциям — нужен фронтенду для энтропии и анимации. */
export function buildAlphabet(opts: GenerateOptions): string {
  let out = "";
  if (opts.lower) out += CHARSETS.lower;
  if (opts.upper) out += CHARSETS.upper;
  if (opts.digits) out += CHARSETS.digits;
  if (opts.symbols) out += CHARSETS.symbols;
  if (opts.excludeSimilar) {
    out = [...out].filter((c) => !SIMILAR.includes(c)).join("");
  }
  return out;
}

/** Равномерное случайное целое [0, max) на Web Crypto, без modulo bias. */
function randomInt(max: number): number {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

/**
 * Запасная генерация для запуска вне Tauri (просмотр дизайна в браузере).
 * Повторяет логику Rust-команды: по символу из каждого набора + перемешивание.
 */
function generateInBrowser(opts: GenerateOptions): string {
  const keys = ["lower", "upper", "digits", "symbols"] as const;
  const pools = keys
    .filter((k) => opts[k])
    .map((k) =>
      [...CHARSETS[k]].filter((c) => !opts.excludeSimilar || !SIMILAR.includes(c)),
    )
    .filter((p) => p.length > 0);

  if (pools.length === 0) throw new Error("Выберите хотя бы один набор символов");
  if (pools.length > opts.length) throw new Error("Длина меньше числа выбранных наборов");

  const alphabet = pools.flat();
  const chars = pools.map((p) => p[randomInt(p.length)]);
  while (chars.length < opts.length) {
    chars.push(alphabet[randomInt(alphabet.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export async function generatePassword(opts: GenerateOptions): Promise<string> {
  if (inTauri) return invoke<string>("generate_password", { opts });
  return generateInBrowser(opts);
}

export async function copyToClipboard(text: string): Promise<void> {
  if (inTauri) return writeText(text);
  return navigator.clipboard.writeText(text);
}
