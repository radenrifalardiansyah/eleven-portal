export type CurrencyCode = "IDR" | "USD" | "SGD" | "EUR" | "MYR";

export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: "IDR", label: "IDR (Rp)" },
  { value: "USD", label: "USD ($)" },
  { value: "SGD", label: "SGD (S$)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "MYR", label: "MYR (RM)" },
];

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  IDR: "id-ID",
  USD: "en-US",
  SGD: "en-SG",
  EUR: "de-DE",
  MYR: "ms-MY",
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_OPTIONS.some((c) => c.value === value);
}

export function formatPrice(amount: number, currency: string): string {
  const code = isCurrencyCode(currency) ? currency : "IDR";
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[code], {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "IDR" ? 0 : 2,
  }).format(amount);
}
