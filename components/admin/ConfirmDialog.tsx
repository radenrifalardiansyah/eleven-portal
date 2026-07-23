"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold text-ink-900">{title}</h3>
            <p className="mt-1 text-sm text-ink-500">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-900/5"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Menghapus..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
