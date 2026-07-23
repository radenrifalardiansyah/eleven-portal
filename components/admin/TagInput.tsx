"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

export default function TagInput({
  value,
  onChange,
  placeholder = "Ketik lalu Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-900/10 bg-white p-2 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20">
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="flex items-center gap-1 rounded-lg bg-brand-blue/10 px-2 py-1 text-xs font-medium text-brand-blue"
        >
          {tag}
          <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[140px] flex-1 border-none bg-transparent py-1 text-sm outline-none"
      />
    </div>
  );
}
