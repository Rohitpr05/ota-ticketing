export function formatEventDate(isoDate: string, language: string): string {
  return new Intl.DateTimeFormat(language, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function formatTime(isoDate: string, language: string): string {
  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(isoDate));
}

// Prices are stored in the currency's smallest unit (e.g. yen, cents); Intl knows how many decimals it has.
export function formatPrice(amount: number, currency: string, language: string): string {
  const formatter = new Intl.NumberFormat(language, { style: "currency", currency });
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 0;
  return formatter.format(amount / 10 ** fractionDigits);
}
