export type FeatureMode = "on" | "off" | "auto";

const featureModes = new Set<FeatureMode>(["on", "off", "auto"]);

function readFeatureMode(value: string | undefined, fallback: FeatureMode): FeatureMode {
  return value && featureModes.has(value as FeatureMode) ? (value as FeatureMode) : fallback;
}

export const HOMEPAGE_CONFIG = {
  hero: {
    mode: readFeatureMode(import.meta.env.PUBLIC_HOME_HERO_MODE, "on")
  },
  seasonalDecorations: {
    mode: readFeatureMode(import.meta.env.PUBLIC_SEASONAL_DECORATIONS_MODE, "auto")
  }
} as const;

export function isFeatureEnabled(mode: FeatureMode, autoValue = true): boolean {
  return mode === "on" || (mode === "auto" && autoValue);
}

type DateParts = {
  year: number;
  month: number;
  day: number;
};

export type SeasonalTheme =
  | "new-year"
  | "defender"
  | "womens-day"
  | "easter"
  | "victory-day"
  | "knowledge-day";

export type SeasonalDecoration = {
  id: SeasonalTheme;
  label: string;
  dateLabel: string;
};

const seasonalDecorations: Record<SeasonalTheme, SeasonalDecoration> = {
  "new-year": { id: "new-year", label: "Новогодний режим", dateLabel: "20 декабря — 10 января" },
  defender: { id: "defender", label: "Режим 23 февраля", dateLabel: "20–25 февраля" },
  "womens-day": { id: "womens-day", label: "Режим 8 марта", dateLabel: "1–10 марта" },
  easter: { id: "easter", label: "Пасхальный режим", dateLabel: "Пасхальная неделя" },
  "victory-day": { id: "victory-day", label: "Режим 9 мая", dateLabel: "1–10 мая" },
  "knowledge-day": {
    id: "knowledge-day",
    label: "Режим 1 сентября",
    dateLabel: "25 августа — 7 сентября"
  }
};

function getMoscowDateParts(date: Date): DateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Moscow",
    year: "numeric"
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, Number(value)])
  );

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day
  };
}

function toDayNumber({ year, month, day }: DateParts): number {
  return Date.UTC(year, month - 1, day) / 86400000;
}

function isWithin(date: DateParts, start: DateParts, end: DateParts): boolean {
  const value = toDayNumber(date);
  return value >= toDayNumber(start) && value <= toDayNumber(end);
}

function orthodoxEaster(year: number): DateParts {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const gregorian = new Date(Date.UTC(year, month - 1, day + 13));

  return {
    year: gregorian.getUTCFullYear(),
    month: gregorian.getUTCMonth() + 1,
    day: gregorian.getUTCDate()
  };
}

function getAutomaticTheme(date: DateParts): SeasonalTheme | null {
  if (date.month === 12 && date.day >= 20) {
    return "new-year";
  }

  if (date.month === 1 && date.day <= 10) {
    return "new-year";
  }

  if (date.month === 2 && date.day >= 20 && date.day <= 25) {
    return "defender";
  }

  if (date.month === 3 && date.day >= 1 && date.day <= 10) {
    return "womens-day";
  }

  const easter = orthodoxEaster(date.year);
  const easterStart = new Date(Date.UTC(easter.year, easter.month - 1, easter.day - 5));
  const easterEnd = new Date(Date.UTC(easter.year, easter.month - 1, easter.day + 7));
  if (
    isWithin(
      date,
      {
        year: easterStart.getUTCFullYear(),
        month: easterStart.getUTCMonth() + 1,
        day: easterStart.getUTCDate()
      },
      {
        year: easterEnd.getUTCFullYear(),
        month: easterEnd.getUTCMonth() + 1,
        day: easterEnd.getUTCDate()
      }
    )
  ) {
    return "easter";
  }

  if (date.month === 5 && date.day >= 1 && date.day <= 10) {
    return "victory-day";
  }

  if ((date.month === 8 && date.day >= 25) || (date.month === 9 && date.day <= 7)) {
    return "knowledge-day";
  }

  return null;
}

export function getSeasonalDecoration(now = new Date()): SeasonalDecoration | null {
  const { mode } = HOMEPAGE_CONFIG.seasonalDecorations;
  if (mode === "off") {
    return null;
  }

  const automaticTheme = getAutomaticTheme(getMoscowDateParts(now));
  return automaticTheme ? seasonalDecorations[automaticTheme] : null;
}

export const seasonalDecorationCatalog = Object.values(seasonalDecorations);
