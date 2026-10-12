import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Kid } from "@/types/domain";
import type { KidResponseDTO } from "@/types/dtos/user";

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

export function toDomainKid(dto: KidResponseDTO): Kid {
  const rawWeeks = dto.prematureWeeks ?? "";
  const parsedWeeks = rawWeeks === "" ? undefined : Number(rawWeeks);
  const prematureWeeks =
    parsedWeeks === undefined || Number.isNaN(parsedWeeks)
      ? undefined
      : parsedWeeks;

  return {
    id: dto.id,
    name: dto.name,
    birthDate: new Date(dto.birthDate),
    gender: dto.gender,
    isPremature: dto.isPremature ?? prematureWeeks !== undefined,
    prematureWeeks,
    parentId: dto.parentId,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
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
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
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
