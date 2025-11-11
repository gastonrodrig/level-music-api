// src/mail/utils/format-latam-date.ts
export const formatLatamDate = (date: Date, tz: string = 'America/Lima'): string => {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: tz,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatLatamDateTime = (
  value: string | Date,
  tz: string = 'America/Lima'
): string => {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: tz,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};
