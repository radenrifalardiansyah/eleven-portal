"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check, CornerDownRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Non-clickable row — used for tree group headers / context-only entries. */
  disabled?: boolean;
  /** Indentation level for tree-style option lists (0 = no indent). */
  indent?: number;
};

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const SelectedIcon = selected?.icon;
  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {SelectedIcon && <SelectedIcon className="h-4 w-4 shrink-0 text-ink-700" />}
        <span className="flex-1 truncate text-left">{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-xl">
          {options.length > 6 && (
            <div className="relative border-b border-ink-900/5 p-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-ink-900/10 bg-ink-900/[0.02] py-1.5 pl-8 pr-2 text-sm outline-none focus:border-brand-blue"
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.map((opt) => {
              const isSelected = opt.value === value;
              const Icon = opt.icon;
              const isChild = (opt.indent ?? 0) >= 2;
              if (opt.disabled) {
                return (
                  <div
                    key={opt.value}
                    style={{ paddingLeft: `${0.75 + (opt.indent ?? 0) * 1}rem` }}
                    className="flex w-full cursor-default items-center gap-2 px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-400"
                  >
                    {isChild && <CornerDownRight className="h-3.5 w-3.5 shrink-0 normal-case text-ink-900/30" />}
                    <span className="flex-1 truncate">{opt.label}</span>
                  </div>
                );
              }
              return (
                <button
                  key={opt.value}
                  type="button"
                  style={{ paddingLeft: `${0.75 + (opt.indent ?? 0) * 1}rem` }}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left text-sm hover:bg-brand-blue/5 ${
                    isSelected ? "bg-brand-blue/10 text-brand-blue" : "text-ink-700"
                  }`}
                >
                  {isChild && <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-ink-900/30" />}
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
            {filtered.length === 0 && <p className="py-6 text-center text-xs text-ink-500">Tidak ditemukan</p>}
          </div>
        </div>
      )}
    </div>
  );
}
