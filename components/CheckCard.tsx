"use client";

interface Props {
  checked: boolean;
  label: string;
  hint: string;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function CheckCard({ checked, label, hint, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
      disabled={disabled}
      className={`check-card${checked ? " checked" : ""}${disabled ? " disabled" : ""}`}
    >
      <span className={`checkbox${checked ? " checked" : ""}`} aria-hidden="true">
        {checked && (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <polyline
              points="1.5,5.5 4.5,8.5 9.5,2.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="check-label">
        <span className="check-name">{label}</span>
        <span className="check-hint">{hint}</span>
      </span>
    </button>
  );
}