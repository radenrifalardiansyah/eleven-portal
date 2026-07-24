"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { ICON_MAP } from "@/components/admin/icon-map";

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
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

  const SelectedIcon = ICON_MAP[value];
  const names = Object.keys(ICON_MAP);
  const filtered = search.trim() ? names.filter((n) => n.toLowerCase().includes(search.toLowerCase())) : names;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
      >
        {SelectedIcon && <SelectedIcon className="h-4 w-4 shrink-0 text-ink-700" />}
        <span className="flex-1 truncate text-left">{value || "Pilih ikon..."}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-xl">
          <div className="relative border-b border-ink-900/5 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ikon..."
              className="w-full rounded-lg border border-ink-900/10 bg-ink-900/[0.02] py-1.5 pl-8 pr-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div className="grid max-h-64 grid-cols-4 gap-1 overflow-y-auto p-2 sm:grid-cols-5">
            {filtered.map((name) => {
              const Icon = ICON_MAP[name];
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setSearch("");
                  }}
                  title={name}
                  className={`relative flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] text-ink-600 hover:bg-brand-blue/5 ${
                    selected ? "bg-brand-blue/10 text-brand-blue" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="w-full truncate text-center">{name}</span>
                  {selected && <Check className="absolute right-1 top-1 h-3 w-3 text-brand-blue" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-6 text-center text-xs text-ink-500">Tidak ditemukan</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
