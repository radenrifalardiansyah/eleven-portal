"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <Image
          src={images[active]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={() => setActive(index)}
              className={clsx(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                active === index ? "border-brand-blue" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
