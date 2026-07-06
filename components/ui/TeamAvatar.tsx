import clsx from "clsx";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function TeamAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center bg-gradient-to-br from-ink-900 to-brand-blue",
        className
      )}
    >
      <span className="font-heading text-4xl font-semibold tracking-wide text-white/90">
        {getInitials(name)}
      </span>
    </div>
  );
}
