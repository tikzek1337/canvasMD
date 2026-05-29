export function nowIso() {
  return new Date().toISOString();
}

export function formatShortDate(value?: string) {
  if (!value) return 'без срока';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}
