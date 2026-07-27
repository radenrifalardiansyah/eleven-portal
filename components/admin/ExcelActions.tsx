"use client";

import { useRef } from "react";
import { Download, Upload, Loader2, FileSpreadsheet } from "lucide-react";

export default function ExcelActions({
  onExport,
  onImport,
  onDownloadTemplate,
  importing,
}: {
  onExport: () => void;
  onImport?: (file: File) => void;
  onDownloadTemplate?: () => void;
  importing?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-1 rounded-xl border border-ink-900/10 bg-white p-1">
      <button
        type="button"
        onClick={onExport}
        title="Export Excel (data saat ini)"
        aria-label="Export Excel"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
      >
        <Download className="h-4 w-4" />
      </button>
      {onDownloadTemplate && (
        <button
          type="button"
          onClick={onDownloadTemplate}
          title="Download Template Import"
          aria-label="Download Template Import"
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
        >
          <FileSpreadsheet className="h-4 w-4" />
        </button>
      )}
      {onImport && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={importing}
            title="Import Excel"
            aria-label="Import Excel"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-900 disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}
