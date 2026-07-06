import { Children, cloneElement, isValidElement, ReactElement, ReactNode } from "react";
import clsx from "clsx";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export default function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <div className={clsx("animate-fade-in-up", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

export function FadeInGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const items = Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, index) =>
        isValidElement(child)
          ? cloneElement(child as ReactElement<{ delay?: number }>, {
              delay: Math.min(index * stagger, 0.6),
            })
          : child
      )}
    </div>
  );
}

export function FadeInItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={clsx("animate-fade-in-up", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
