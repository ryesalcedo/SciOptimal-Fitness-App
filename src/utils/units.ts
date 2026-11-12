/** Profile stats are stored in pounds and inches. Formulas that expect metric convert here. */

export const POUNDS_PER_KILOGRAM = 2.2046226218;

export function poundsToKilograms(pounds: number): number {
  return pounds / POUNDS_PER_KILOGRAM;
}

export function inchesToCentimeters(inches: number): number {
  return inches * 2.54;
}

export function toDate(value: Date | string | number | null | undefined): Date {
  if (value instanceof Date) return value;
  if (value === null || value === undefined || value === '') return new Date(NaN);
  return new Date(value);
}

export function dayKey(value: Date | string | number = new Date()): string {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDay(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

export function isSameDay(value: Date | string | number, day: Date = new Date()): boolean {
  const date = toDate(value);
  return !Number.isNaN(date.getTime()) && date.toDateString() === day.toDateString();
}
