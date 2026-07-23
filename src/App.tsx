// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

import { useCallback, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "./api";
import { HeatGauge } from "./components/HeatGauge";
import { ToggleChip } from "./components/ToggleChip";
import { useForge } from "./hooks/useForge";
import { DEFAULT_OPTIONS, type GenerateOptions } from "./types";

const CHARSET_TOGGLES = [
  { key: "lower", label: "abc", hint: "Строчные буквы" },
  { key: "upper", label: "ABC", hint: "Заглавные буквы" },
  { key: "digits", label: "0–9", hint: "Цифры" },
  { key: "symbols", label: "#$%", hint: "Символы" },
] as const;

export default function App() {
  const [opts, setOpts] = useState<GenerateOptions>(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);
  const { display, forging, error, forge } = useForge();

  const set = useCallback(
    <K extends keyof GenerateOptions>(key: K, value: GenerateOptions[K]) =>
      setOpts((prev) => ({ ...prev, [key]: value })),
    [],
  );

  // Первый пароль — сразу при запуске, чтобы окно не встречало пустотой.
  useEffect(() => {
    void forge(DEFAULT_OPTIONS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCopy = useCallback(async () => {
    if (!display || forging) return;
    await copyToClipboard(display);
    setCopied(true);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }, [display, forging]);

  const nothingSelected =
    !opts.lower && !opts.upper && !opts.digits && !opts.symbols;

  return (
    <main className="app">
      <header className="masthead">
        <h1 className="brand">Кузня</h1>
        <span className="brand-sub">генератор паролей</span>
      </header>

      <section className="anvil" aria-live="polite">
        <output className={`password${forging ? " is-forging" : ""}`}>
          {display || "•".repeat(opts.length)}
        </output>
        <div className="anvil-actions">
          <button
            type="button"
            className="btn btn-copy"
            onClick={onCopy}
            disabled={!display || forging}
          >
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
      </section>

      <HeatGauge opts={opts} />

      <section className="controls">
        <label className="length">
          <span className="control-label">Длина</span>
          <input
            type="range"
            min={4}
            max={64}
            value={opts.length}
            onChange={(e) => set("length", Number(e.target.value))}
          />
          <span className="length-value">{opts.length}</span>
        </label>

        <div className="chips" role="group" aria-label="Наборы символов">
          {CHARSET_TOGGLES.map(({ key, label, hint }) => (
            <ToggleChip
              key={key}
              label={label}
              hint={hint}
              checked={opts[key]}
              onChange={(v) => set(key, v)}
            />
          ))}
        </div>

        <label className="similar">
          <input
            type="checkbox"
            checked={opts.excludeSimilar}
            onChange={(e) => set("excludeSimilar", e.target.checked)}
          />
          <span>Исключить похожие символы (l, 1, O, 0…)</span>
        </label>
      </section>

      {error && <p className="error">{error}</p>}

      <button
        type="button"
        className="btn btn-forge"
        onClick={() => void forge(opts)}
        disabled={nothingSelected || forging}
      >
        {forging ? "Куётся…" : "Выковать"}
      </button>
    </main>
  );
}
