import { format, formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatIDR(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'dd MMMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), "dd MMMM yyyy, HH:mm", { locale: id });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '-';
  try {
    return formatDistance(new Date(dateStr), new Date(), { addSuffix: true, locale: id });
  } catch {
    return dateStr;
  }
}
