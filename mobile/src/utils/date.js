export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toTimeString(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDisplayDate(dateStr, timeStr) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    const date = new Date(y, m - 1, d, h, min);
    const dateLabel = date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const timeLabel = date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    return `${dateLabel} · ${timeLabel}`;
  } catch {
    return `${dateStr} ${timeStr}`;
  }
}
