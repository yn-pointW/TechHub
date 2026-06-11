import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import i18n from '@/i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ro-MD') + ' lei';
}

export function formatMonthlyPayment(price: number): string {
  const monthly = Math.round(price / 12).toLocaleString('ro-MD');
  return i18n.language === 'ro'
    ? `de la ${monthly} lei/lună`
    : `от ${monthly} lei/мес`;
}
