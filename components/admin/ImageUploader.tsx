"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadMediaFile } from "@/lib/supabase/upload";

export function ImageUploader({
  value,
  onChange,
  pathPrefix,
}: {
  value: string;
  onChange: (url: string) => void;
  pathPrefix: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const url = await uploadMediaFile(file, pathPrefix);
      onChange(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-ink-900/10 bg-ink-900/5">
          <Image src={value} alt="" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink-900/60 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-ink-900/20 text-ink-500 transition hover:border-brand-blue hover:text-brand-blue"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function GalleryUploader({
  value,
  onChange,
  pathPrefix,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  pathPrefix: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFiles(files: FileList) {
    setLoading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadMediaFile(f, pathPrefix)));
      onChange([...value, ...uploaded]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {value.map((url, i) => (
        <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-ink-900/10 bg-ink-900/5">
          <Image src={url} alt="" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink-900/60 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-ink-900/20 text-ink-500 transition hover:border-brand-blue hover:text-brand-blue"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
