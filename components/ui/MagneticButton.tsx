"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ButtonHTMLAttributes, AnchorHTMLAttributes, PointerEvent, ReactNode } from "react";
import clsx from "clsx";

type MagneticButtonProps = (AnchorHTMLAttributes<HTMLElement> & ButtonHTMLAttributes<HTMLElement>) & {
  children: ReactNode;
  variant?: "solid" | "outline";
  as?: "a" | "button";
};

export default function MagneticButton({
  children,
  className,
  variant = "solid",
  as = "a",
  ...props
}: MagneticButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  const MotionComponent = as === "button" ? motion.button : motion.a;

  return (
    <MotionComponent
      {...(props as any)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.94 }}
      className={clsx(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300",
        variant === "solid"
          ? "bg-brand-gradient text-white shadow-[0_8px_30px_rgba(0,83,255,0.35)] hover:shadow-[0_8px_40px_rgba(0,83,255,0.5)]"
          : "border border-brand-ink/20 text-brand-ink hover:border-brand-blue hover:text-brand-blue",
        className
      )}
    >
      {children}
    </MotionComponent>
  );
}
