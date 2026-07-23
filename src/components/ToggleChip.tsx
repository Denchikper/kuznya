// Кузня — генератор паролей
// by Benovich · https://github.com/Denchikper/password_generator

interface Props {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

/** Кнопка-переключатель набора символов. */
export function ToggleChip({ label, hint, checked, onChange }: Props) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={checked}
      title={hint}
      onClick={() => onChange(!checked)}
    >
      {label}
    </button>
  );
}
