// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

export interface GenerateOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

export const DEFAULT_OPTIONS: GenerateOptions = {
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeSimilar: false,
};

/** Стадии «нагрева» — метафора надёжности пароля. */
export type HeatLevel = "cold" | "warming" | "forging" | "white-hot";
