import Image from "next/image";
import clsx from "clsx";

export default function TeamAvatar({
  name,
  photoUrl,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <div className={clsx("relative overflow-hidden", className)}>
        <Image src={photoUrl} alt={name} fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div className={clsx("flex items-center justify-center bg-brand-blue-light", className)}>
      <span className="font-heading text-4xl font-semibold text-white">
        {(name || "?").charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
