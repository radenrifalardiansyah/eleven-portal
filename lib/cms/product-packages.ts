import { formatPrice } from "@/lib/currency";

export type PackageDiscountType = "none" | "percent" | "amount";

export type ProductPackage = {
  id: string;
  name: string;
  price_amount: number;
  discount_type: PackageDiscountType;
  discount_value: number;
  description: string;
};

export const PACKAGE_DISCOUNT_OPTIONS: { value: PackageDiscountType; label: string }[] = [
  { value: "none", label: "Tanpa Diskon" },
  { value: "percent", label: "Persen (%)" },
  { value: "amount", label: "Nominal (Rp)" },
];

export function createEmptyPackage(): ProductPackage {
  return {
    id: crypto.randomUUID(),
    name: "",
    price_amount: 0,
    discount_type: "none",
    discount_value: 0,
    description: "",
  };
}

/** Final price after applying the package's own discount (percent or fixed amount). */
export function packageFinalPrice(pkg: ProductPackage): number {
  if (pkg.discount_type === "percent") {
    return Math.max(0, pkg.price_amount - (pkg.price_amount * pkg.discount_value) / 100);
  }
  if (pkg.discount_type === "amount") {
    return Math.max(0, pkg.price_amount - pkg.discount_value);
  }
  return pkg.price_amount;
}

/** Short badge text for a discounted package, e.g. "Diskon 10%" or "Diskon Rp 100.000". null when no discount. */
export function packageDiscountLabel(pkg: ProductPackage, currency: string): string | null {
  if (pkg.discount_type === "percent" && pkg.discount_value > 0) return `Diskon ${pkg.discount_value}%`;
  if (pkg.discount_type === "amount" && pkg.discount_value > 0) return `Diskon ${formatPrice(pkg.discount_value, currency)}`;
  return null;
}

/** "Rp X" when there's one package, "Mulai dari Rp X" when there are several, or a fallback when there are none. */
export function packagePriceSummary(packages: ProductPackage[], currency: string): string {
  if (packages.length === 0) return "Belum ada paket";
  const lowest = Math.min(...packages.map(packageFinalPrice));
  const label = formatPrice(lowest, currency);
  return packages.length > 1 ? `Mulai dari ${label}` : label;
}
