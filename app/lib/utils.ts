import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shouldUsePut<T extends Record<string, unknown>>(
  original: T,
  updated: T,
  fields: (keyof T)[],
): boolean {
  const changedFields = fields.filter(
    (field) => original[field] !== updated[field],
  );
  return changedFields.length === fields.length;
}

export function getUserIdFromToken(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64));
  return payload.userId;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function parseLocalDate(value: string): Date | null {
  if (!value) {
    return null;
  }
  const parts = value.split("T")[0].split("-").map(Number);
  if (parts.length !== 3) {
    return null;
  }
  const [year, month, day] = parts;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function eventDateKey(value: string): string {
  if (!value) {
    return "";
  }
  const key = value.split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return "";
  }
  return parseLocalDate(key) ? key : "";
}

export function validateEventDateKey(
  dateKey: string,
  birthIso: string | null,
): string | null {
  const date = parseLocalDate(dateKey);
  if (!date) {
    return "Digite uma data válida.";
  }
  if (birthIso) {
    const birthKey = eventDateKey(birthIso);
    const birth = birthKey ? parseLocalDate(birthKey) : null;
    if (birth && date.getTime() < birth.getTime()) {
      return "A data não pode ser anterior ao nascimento.";
    }
  }
  const today = new Date();
  const startOfTomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );
  if (date.getTime() >= startOfTomorrow.getTime()) {
    return "A data não pode ser futura.";
  }
  return null;
}

export function formatDatePtBR(value: string): string | null {
  const date = parseLocalDate(value);
  if (!date) {
    return null;
  }
  return dateFormatter.format(date);
}

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

export function formatDateShortPtBR(value: string): string | null {
  const date = parseLocalDate(value);
  if (!date) {
    return null;
  }
  return shortDateFormatter.format(date);
}

export function formatRelativeDay(value: string): string | null {
  const date = parseLocalDate(value);
  if (!date) {
    return null;
  }
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - date.getTime()) / 86400000,
  );
  if (diffDays <= 0) {
    return "hoje";
  }
  if (diffDays === 1) {
    return "ontem";
  }
  if (diffDays < 30) {
    return `há ${diffDays} dias`;
  }
  return formatDatePtBR(value) ?? value;
}

export function birthDateToString(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

export function toLocalDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function localDateKeyToISO(value: string): string | null {
  const date = parseLocalDate(value);
  if (!date) {
    return null;
  }
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

export function ageInMonths(birthDate: string): number | null {
  const date = parseLocalDate(birthDate);
  if (!date) {
    return null;
  }
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

export const MONTH_SHORT_NAMES_PT_BR = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function formatAgeFromBirthDate(birthDate: string): string {
  const months = ageInMonths(birthDate);
  if (months === null || Number.isNaN(months) || months < 0) {
    return "";
  }
  const wholeMonths = Math.floor(months);
  if (wholeMonths < 1) {
    return "menos de 1 mês";
  }
  if (wholeMonths < 12) {
    return wholeMonths === 1 ? "1 mês" : `${wholeMonths} meses`;
  }
  const years = Math.floor(wholeMonths / 12);
  return years === 1 ? "1 ano" : `${years} anos`;
}

export function maskDateBr(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function brDateToIsoKey(br: string): string | null {
  const match = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return null;
  }
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (date.getTime() > Date.now()) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

export function isoToBrDate(iso: string): string {
  return formatDatePtBR(iso) ?? "";
}
