"use client";

interface Props {
  on: boolean;
  label: string;
  hint: string;
  onChange: (val: boolean) => void;
}

export default function Toggle({ on, label, hint, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="toggle-row"
    >
      <span className={`toggle-track${on ? " on" : ""}`}>
        <span className="toggle-knob" />
      </span>
      <span className="toggle-label">
        <span className="toggle-name">{label}</span>
        <span className="toggle-hint">{hint}</span>
      </span>
    </button>
  );
}