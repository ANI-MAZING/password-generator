"use client";

import { useEffect } from "react";
import { usePasswordGenerator } from "@/hooks/usePasswordGenerator";
import { Mode } from "@/lib/generator";
import StrengthMeter from "./StrengthMeter";
import CheckCard from "./CheckCard";
import Toggle from "./Toggle";

const MODES: { id: Mode; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "pronounceable", label: "Pronounceable" },
  { id: "passphrase", label: "Passphrase" },
];

const activeCharCount = (opts: {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}) =>
  [opts.uppercase, opts.lowercase, opts.numbers, opts.symbols].filter(Boolean).length;

export default function PasswordGenerator() {
  const {
    password,
    strength,
    copied,
    mode,
    randomOpts,
    passphraseOpts,
    generate,
    setMode,
    setRandomOpts,
    setPassphraseOpts,
    copy,
  } = usePasswordGenerator();

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount = activeCharCount(randomOpts);
  const isOnlyActive = (key: "uppercase" | "lowercase" | "numbers" | "symbols") =>
    randomOpts[key] && activeCount === 1;

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <h1>Password Generator</h1>
        <p>Generate secure, random passwords</p>
      </div>

      {/* Mode tabs */}
      <div className="tabs" role="tablist" aria-label="Password mode">
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            className={`tab${mode === id ? " active" : ""}`}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Password display */}
      <div className="pw-display" aria-label="Generated password" aria-live="polite">
        <span className="pw-text">{password || "Click generate"}</span>
      </div>

      {/* Strength meter */}
      <StrengthMeter strength={strength} />

      {/* Options — shared length slider for random + pronounceable */}
      {(mode === "random" || mode === "pronounceable") && (
        <div className="opts-section">
          <div className="slider-row">
            <label htmlFor="length-slider" className="slider-label">
              Length
            </label>
            <input
              id="length-slider"
              type="range"
              min={6}
              max={64}
              step={1}
              value={randomOpts.length}
              onChange={(e) => setRandomOpts({ length: Number(e.target.value) })}
              className="slider"
            />
            <span className="slider-value">{randomOpts.length}</span>
          </div>

          {/* Character set options — only for random mode */}
          {mode === "random" && (
            <>
              <div className="check-grid">
                <CheckCard
                  checked={randomOpts.uppercase}
                  label="Uppercase"
                  hint="A–Z"
                  disabled={isOnlyActive("uppercase")}
                  onChange={(v) => setRandomOpts({ uppercase: v })}
                />
                <CheckCard
                  checked={randomOpts.lowercase}
                  label="Lowercase"
                  hint="a–z"
                  disabled={isOnlyActive("lowercase")}
                  onChange={(v) => setRandomOpts({ lowercase: v })}
                />
                <CheckCard
                  checked={randomOpts.numbers}
                  label="Numbers"
                  hint="0–9"
                  disabled={isOnlyActive("numbers")}
                  onChange={(v) => setRandomOpts({ numbers: v })}
                />
                <CheckCard
                  checked={randomOpts.symbols}
                  label="Symbols"
                  hint="!@#$%"
                  disabled={isOnlyActive("symbols")}
                  onChange={(v) => setRandomOpts({ symbols: v })}
                />
              </div>

              <Toggle
                on={randomOpts.excludeSimilar}
                label="Exclude similar"
                hint="0 O o 1 l I |"
                onChange={(v) => setRandomOpts({ excludeSimilar: v })}
              />
              <Toggle
                on={randomOpts.mustContain}
                label="Must contain"
                hint="At least 1 of each"
                onChange={(v) => setRandomOpts({ mustContain: v })}
              />
            </>
          )}
        </div>
      )}

      {/* Passphrase options */}
      {mode === "passphrase" && (
        <div className="opts-section">
          <div className="slider-row">
            <label htmlFor="word-slider" className="slider-label">
              Words
            </label>
            <input
              id="word-slider"
              type="range"
              min={3}
              max={8}
              step={1}
              value={passphraseOpts.wordCount}
              onChange={(e) => setPassphraseOpts({ wordCount: Number(e.target.value) })}
              className="slider"
            />
            <span className="slider-value">{passphraseOpts.wordCount}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button
          className="btn-generate"
          onClick={() => generate()}
          aria-label="Generate new password"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 7.5a5.5 5.5 0 1 0 5.5-5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <polyline
              points="5.5,0.5 2,3.5 5.5,6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Generate
        </button>
        <button
          className={`btn-copy${copied ? " copied" : ""}`}
          onClick={() => copy(password)}
          aria-label={copied ? "Copied to clipboard" : "Copy password to clipboard"}
          disabled={!password}
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <polyline
                  points="1,7 4.5,10.5 12,2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M9 4V2.5A1.5 1.5 0 0 0 7.5 1h-5A1.5 1.5 0 0 0 1 2.5v5A1.5 1.5 0 0 0 2.5 9H4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}