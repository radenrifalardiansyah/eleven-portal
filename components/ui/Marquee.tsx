"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export default function Marquee({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("group relative flex overflow-hidden", className)}>
      <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16 group-hover:[animation-play-state:paused]">
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 animate-marquee items-center gap-16 pr-16 group-hover:[animation-play-state:paused]"
      >
        {children}
      </div>
    </div>
  );
}
