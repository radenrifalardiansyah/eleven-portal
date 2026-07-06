"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, PointerEvent, CSSProperties } from "react";
import clsx from "clsx";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  glare?: boolean;
  strength?: number;
  style?: CSSProperties;
};

export default function TiltCard({
  children,
  className,
  glare = true,
  strength = 12,
  style,
}: TiltCardProps) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);
  const glareX = useSpring(x, springConfig);
  const glareY = useSpring(y, springConfig);
  const glareXPercent = useTransform(glareX, (v) => `${v * 100}%`);
  const glareYPercent = useTransform(glareY, (v) => `${v * 100}%`);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareXPercent} ${glareYPercent}, rgba(255,255,255,0.25), transparent 60%)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(px);
    y.set(py);
    rotateY.set((px - 0.5) * strength);
    rotateX.set((0.5 - py) * strength);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ ...style, rotateX, rotateY, transformPerspective: 900 }}
      className={clsx("relative will-change-transform", className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBackground }}
        />
      )}
    </motion.div>
  );
}
