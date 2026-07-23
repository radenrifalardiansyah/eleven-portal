"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/40 p-4 py-10 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} rounded-2xl bg-white shadow-2xl`}
          >
            <div className="flex items-start justify-between border-b border-ink-900/5 px-6 py-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-ink-900">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-ink-900/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
