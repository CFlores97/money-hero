export const currencyFormatter = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 2,
});

export const compactCurrencyFormatter = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const dateTimeFormatter = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

export function formatDateTime(date: string) {
  return dateTimeFormatter.format(new Date(date));
}
