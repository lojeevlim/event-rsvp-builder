"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, TriangleAlert } from "lucide-react";

export type ToastMsg = { ok: boolean; text: string } | null;

/** A glassy notice at the top of the screen with an animated icon and a countdown bar. */
export default function SaveToast({ msg, onClose, duration = 4500 }: { msg: ToastMsg; onClose: () => void; duration?: number }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [msg, duration, onClose]);

  const ok = msg?.ok ?? true;
  const tone = ok ? "from-emerald-400 to-emerald-600 shadow-emerald-500/40" : "from-rose-400 to-rose-600 shadow-rose-500/40";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg.text}
            role={ok ? "status" : "alert"}
            initial={{ opacity: 0, y: -28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-surface/85 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3.5 p-3.5 pr-3">
              <motion.span
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.1 }}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg ${tone}`}
              >
                {ok ? (
                  <Check size={20} strokeWidth={3} />
                ) : (
                  <TriangleAlert size={19} strokeWidth={2.5} />
                )}
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-fg">{ok ? "Saved" : "Something went wrong"}</p>
                <p className="mt-0.5 text-xs leading-snug text-soft">{msg.text}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Dismiss" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-soft transition-colors hover:bg-surface-muted hover:text-fg">
                <X size={14} />
              </button>
            </div>
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              style={{ transformOrigin: "left" }}
              className={`h-0.5 bg-gradient-to-r ${ok ? "from-emerald-400 to-emerald-600" : "from-rose-400 to-rose-600"}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
