import clsx from "clsx";
import FadeIn from "./FadeIn";

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={clsx(
        "relative mx-auto mb-16 max-w-2xl",
        align === "center" ? "text-center" : "text-left mx-0",
        className
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -top-10 select-none whitespace-nowrap font-heading text-[4rem] font-bold uppercase tracking-widest text-brand-ink/[0.05] sm:text-[5.5rem]",
          align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
        )}
      >
        {eyebrow}
      </span>
      <FadeIn>
        <h2 className="relative z-10 font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
          {title}
        </h2>
      </FadeIn>
      {description && (
        <FadeIn delay={0.1}>
          <p className="relative z-10 mt-4 text-base text-brand-ink/80 sm:text-lg">{description}</p>
        </FadeIn>
      )}
    </div>
  );
}
