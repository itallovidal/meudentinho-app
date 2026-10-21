import {
  archLabel,
  dentitionLabel,
  sideLabel,
  toothEventTypeLabel,
  toothTypeLabel,
} from "@/lib/teethLabels";
import { THEME } from "@/lib/themeColors";
import { eventDateKey, formatDatePtBR, toLocalDateKey } from "@/lib/utils";
import type { ToothEvent } from "@/types/teeth";

const colors = THEME.light;

export interface HistoryReportPeriod {
  startDate: string;
  endDate: string;
}

export interface HistoryReportInput {
  kidName: string;
  kidBirthDate: string | null;
  kidGender: "male" | "female";
  kidPrematureWeeks?: string | null;
  events: ToothEvent[];
  period: HistoryReportPeriod;
  generatedAt?: Date;
}

const generatedAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function isPeriodValid(period: HistoryReportPeriod): boolean {
  if (!period.startDate || !period.endDate) {
    return false;
  }
  return period.startDate <= period.endDate;
}

export function filterEventsByPeriod(
  events: ToothEvent[],
  period: HistoryReportPeriod,
): ToothEvent[] {
  if (!isPeriodValid(period)) {
    return [];
  }
  return events.filter((event) => {
    const dateKey = eventDateKey(event.occurrenceDate);
    return (
      dateKey !== "" && dateKey >= period.startDate && dateKey <= period.endDate
    );
  });
}

function formatPeriodDate(dateKey: string): string {
  return formatDatePtBR(dateKey) ?? dateKey;
}

function genderLabel(gender: "male" | "female"): string {
  return gender === "female" ? "Feminino" : "Masculino";
}

function prematurityLabel(prematureWeeks?: string | null): string {
  const weeks = Number.parseInt(prematureWeeks?.trim() ?? "", 10);
  if (!Number.isFinite(weeks) || weeks <= 0) {
    return "Não";
  }
  return `${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
}

function subtractMonths(date: Date, months: number): Date {
  const targetMonth = date.getMonth() - months;
  const lastDayOfTargetMonth = new Date(
    date.getFullYear(),
    targetMonth + 1,
    0,
  ).getDate();
  return new Date(
    date.getFullYear(),
    targetMonth,
    Math.min(date.getDate(), lastDayOfTargetMonth),
  );
}

export function resolveDefaultHistoryStartDate(
  kidBirthDate: string | null,
  today: Date = new Date(),
): string {
  const todayKey = toLocalDateKey(today);
  const fiveMonthsAgoKey = toLocalDateKey(subtractMonths(today, 5));
  const birthKey = kidBirthDate ? eventDateKey(kidBirthDate) : "";
  if (birthKey && birthKey <= todayKey && birthKey > fiveMonthsAgoKey) {
    return birthKey;
  }
  return fiveMonthsAgoKey;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function chronologicalEvents(events: ToothEvent[]): ToothEvent[] {
  return [...events].sort(
    (a, b) =>
      eventDateKey(a.occurrenceDate).localeCompare(
        eventDateKey(b.occurrenceDate),
      ) || (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
  );
}

function buildEventRows(events: ToothEvent[]): string {
  return chronologicalEvents(events)
    .map((event) => {
      const date =
        formatDatePtBR(eventDateKey(event.occurrenceDate)) ?? "sem data";
      const position = `${archLabel(event.arch)} • ${sideLabel(event.side)}`;
      const note = event.note?.trim() ? event.note.trim() : "—";
      return `<tr>
        <td>${escapeHtml(date)}</td>
        <td>${escapeHtml(toothTypeLabel(event.toothType))}</td>
        <td>${escapeHtml(position)}</td>
        <td>${escapeHtml(toothEventTypeLabel(event.eventType))}</td>
        <td>${escapeHtml(dentitionLabel(event.dentition))}</td>
        <td>${escapeHtml(note)}</td>
      </tr>`;
    })
    .join("");
}

export function buildHistoryReportHtml(input: HistoryReportInput): string {
  const {
    kidName,
    kidBirthDate,
    kidGender,
    kidPrematureWeeks,
    events,
    period,
    generatedAt = new Date(),
  } = input;
  const birthKey = kidBirthDate ? eventDateKey(kidBirthDate) : "";
  const birthLabel = birthKey ? formatPeriodDate(birthKey) : null;
  const sexLabel = genderLabel(kidGender);
  const prematurity = prematurityLabel(kidPrematureWeeks);
  const periodLabel = `${formatPeriodDate(period.startDate)} a ${formatPeriodDate(period.endDate)}`;
  const countLabel = `${events.length} ${events.length === 1 ? "registro" : "registros"}`;
  const rows = buildEventRows(events);
  const generatedLabel = generatedAtFormatter.format(generatedAt);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Histórico de registros — ${escapeHtml(kidName)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      color: ${colors.base700};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    header {
      border-bottom: 2px solid ${colors.base300};
      margin-bottom: 20px;
      padding-bottom: 16px;
    }
    .brand {
      margin: 0 0 6px;
      color: ${colors.primary500};
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0 0 10px;
      color: ${colors.primary800};
      font-size: 22px;
    }
    .meta {
      margin: 0;
      color: ${colors.base600};
      font-size: 13px;
      line-height: 1.7;
    }
    .summary {
      background: ${colors.base200};
      border-radius: 12px;
      color: ${colors.base700};
      font-size: 13px;
      margin-bottom: 18px;
      padding: 12px 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    thead th {
      border-bottom: 2px solid ${colors.base300};
      color: ${colors.base500};
      font-size: 10px;
      letter-spacing: 0.06em;
      padding: 8px;
      text-align: left;
      text-transform: uppercase;
    }
    tbody td {
      border-bottom: 1px solid ${colors.base300};
      color: ${colors.base700};
      padding: 9px 8px;
      vertical-align: top;
    }
    tbody tr { page-break-inside: avoid; }
    .empty {
      border: 1px dashed ${colors.base300};
      border-radius: 12px;
      color: ${colors.base500};
      font-size: 13px;
      padding: 24px;
      text-align: center;
    }
    footer {
      color: ${colors.base400};
      font-size: 10px;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <header>
    <p class="brand">Janelinha</p>
    <h1>Histórico de registros</h1>
    <p class="meta">
      <strong>Dependente:</strong> ${escapeHtml(kidName)}${birthLabel ? `<br /><strong>Data de nascimento:</strong> ${escapeHtml(birthLabel)}` : ""}<br />
      <strong>Sexo:</strong> ${escapeHtml(sexLabel)}<br />
      <strong>Prematuridade:</strong> ${escapeHtml(prematurity)}<br />
      <strong>Período:</strong> ${escapeHtml(periodLabel)}
    </p>
  </header>
  <div class="summary">${escapeHtml(countLabel)} no período selecionado</div>
  ${
    rows
      ? `<table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Dente</th>
        <th>Arcada</th>
        <th>Evento</th>
        <th>Dentição</th>
        <th>Observação</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
      : `<p class="empty">Nenhum registro encontrado neste período.</p>`
  }
  <footer>Relatório gerado em ${escapeHtml(generatedLabel)} pelo app Janelinha.</footer>
</body>
</html>`;
}
