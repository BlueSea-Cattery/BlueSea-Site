import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const statusLabels: Record<string, string> = {
  available: 'Доступен',
  reserved: 'Забронирован',
  evaluation: 'На оценке',
  sold: 'Продан',
};

export const statusColors: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reserved: 'bg-amber-50 text-amber-700 border-amber-200',
  evaluation: 'bg-blue-50 text-blue-700 border-blue-200',
  sold: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const genderLabels: Record<string, string> = {
  male: 'Кот',
  female: 'Кошка',
};
