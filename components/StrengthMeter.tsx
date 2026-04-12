"use client";

import { StrengthResult } from "@/lib/generator";

interface Props {
  strength: StrengthResult | null;
}

const COLORS: Record<number, string> = {
  1: "#E24B4A",
  2: "#EF9F27",
  3: "#1D9E75",
  4: "#1D9E75",
};

const LABELS: Record<number, string> = {
  1: "Weak",
  2: "Fair",
  3: "Strong",
  4: "Very strong",
};

export default function StrengthMeter({ strength }: Props) {
  const score = strength?.score ?? 0;

  return (
    <div className="strength-row">
      <div className="bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bar"
            style={{
              background: i <= score ? COLORS[score] : undefined,
              opacity: i <= score ? 1 : 0.2,
              transition: "background 0.3s, opacity 0.3s",
            }}
          />
        ))}
      </div>
      <span className="strength-label">
        {strength ? LABELS[score] : ""}
      </span>
    </div>
  );
}