// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/kuznya

import { entropyBits, heatFraction, heatLevel, HEAT_LABELS } from "../entropy";
import type { GenerateOptions } from "../types";

/** Шкала «нагрева металла» — индикатор надёжности будущего пароля. */
export function HeatGauge({ opts }: { opts: GenerateOptions }) {
  const bits = entropyBits(opts);
  const level = heatLevel(bits);

  return (
    <div className="heat" data-level={level}>
      <div className="heat-track" role="meter" aria-label="Надёжность пароля">
        {/* Градиент лежит во всю шкалу, clip-path открывает его слева направо */}
        <div
          className="heat-fill"
          style={{ clipPath: `inset(0 ${100 - heatFraction(bits) * 100}% 0 0)` }}
        />
      </div>
      <div className="heat-row">
        <span className="heat-label">{HEAT_LABELS[level]}</span>
        <span className="heat-bits">{Math.round(bits)} бит энтропии</span>
      </div>
    </div>
  );
}
