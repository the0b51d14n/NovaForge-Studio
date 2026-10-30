// Horaires d'ouverture : horaires de la semaine, jours fériés et fermetures exceptionnelles.
// Tout est calculé en dates AAAA-MM-JJ à l'heure de Paris (le serveur peut tourner dans un autre fuseau).

/** Créneau d'une journée en minutes depuis minuit, `null` = fermé */
export type Slot = [number, number] | null;

/**
 * Fermeture exceptionnelle saisie dans l'administration (bornes incluses, format AAAA-MM-JJ).
 * from / to (HH:MM, facultatifs) : fermeture partielle, par exemple une demi-journée, chaque jour de la période.
 */
export type Closure = { start: string; end: string; reason: string; from?: string; to?: string };

/** Plage d'ouverture en minutes depuis minuit */
export type Range = [number, number];

/** Ce qu'il faut pour savoir si le studio est ouvert un jour donné */
export type Calendar = {
  /** Horaires de la semaine, du lundi (0) au dimanche (6) */
  slots: Slot[];
  closures: Closure[];
  /** true : fermé automatiquement les jours fériés */
  holidays: boolean;
};

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** « 09:30 » → 570 */
export function toMinutes(time: string) {
  const [h, m = '0'] = time.split(':');
  return Number(h) * 60 + Number(m);
}

/** 540 → « 9 h », 570 → « 9 h 30 » */
export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

// Midi UTC : aucune date ne bascule sur la veille ou le lendemain, quel que soit le fuseau
const toDate = (iso: string) => new Date(`${iso}T12:00:00Z`);

/** Décale une date AAAA-MM-JJ de n jours */
export function addDays(iso: string, n: number) {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Jour de la semaine d'une date, 0 = lundi */
export const weekday = (iso: string) => (toDate(iso).getUTCDay() + 6) % 7;

/** Lundi de la semaine d'une date */
export const startOfWeek = (iso: string) => addDays(iso, -weekday(iso));

/** « 2026-11-11 » → « mercredi 11 novembre », « 2027-01-01 » → « vendredi 1er janvier » (options Intl au choix) */
export const formatDay = (iso: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) =>
  toDate(iso)
    .toLocaleDateString('fr-FR', { ...options, timeZone: 'UTC' })
    .replace(/(^|\s)1(?=\s)/, '$11er');

/** Date (AAAA-MM-JJ) et minutes écoulées depuis minuit, à Paris */
export function parisNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** Jours fériés en France métropolitaine (hors Alsace-Moselle) : AAAA-MM-JJ → nom */
export function frenchHolidays(year: number): Map<string, string> {
  // Dimanche de Pâques (algorithme de Meeus)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const h = (19 * a + b - Math.floor(b / 4) - Math.floor((b - Math.floor((b + 8) / 25) + 1) / 3) + 15) % 30;
  const l = (32 + 2 * (b % 4) + 2 * Math.floor(c / 4) - h - (c % 4)) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return new Map([
    [`${year}-01-01`, "Jour de l'an"],
    [addDays(easter, 1), 'Lundi de Pâques'],
    [`${year}-05-01`, 'Fête du Travail'],
    [`${year}-05-08`, 'Victoire 1945'],
    [addDays(easter, 39), 'Ascension'],
    [addDays(easter, 50), 'Lundi de Pentecôte'],
    [`${year}-07-14`, 'Fête nationale'],
    [`${year}-08-15`, 'Assomption'],
    [`${year}-11-01`, 'Toussaint'],
    [`${year}-11-11`, 'Armistice 1918'],
    [`${year}-12-25`, 'Noël'],
  ]);
}

/** « 9 h – 12 h », ou « 9 h – 11 h / 15 h – 18 h » si une fermeture coupe la journée */
export const formatRanges = (ranges: Range[]) =>
  ranges.map(([a, b]) => `${formatTime(a)} – ${formatTime(b)}`).join(' / ');

// Retire une plage fermée [a, b] des plages d'ouverture
function subtract(ranges: Range[], [a, b]: Range): Range[] {
  return ranges.flatMap(([s, e]): Range[] => {
    if (b <= s || a >= e) return [[s, e]];
    const left: Range[] = a > s ? [[s, a]] : [];
    const right: Range[] = b < e ? [[b, e]] : [];
    return [...left, ...right];
  });
}

/**
 * Journée réelle d'une date : plages d'ouverture après fermetures exceptionnelles et jours fériés.
 * reason : motif de la fermeture (journée entière ou partielle), null si la journée est normale.
 */
export function dayOn(iso: string, cal: Calendar): { ranges: Range[]; reason: string | null; partial: boolean } {
  const usual = cal.slots[weekday(iso)];
  const manual = cal.closures.filter((c) => c.start <= iso && iso <= c.end);
  const label = (c: Closure) => c.reason || 'Fermeture exceptionnelle';

  const full = manual.find((c) => !c.from || !c.to);
  if (full) return { ranges: [], reason: label(full), partial: false };
  const holiday = cal.holidays ? frenchHolidays(Number(iso.slice(0, 4))).get(iso) : undefined;
  if (holiday) return { ranges: [], reason: holiday, partial: false };
  if (!usual) return { ranges: [], reason: null, partial: false };

  let ranges: Range[] = [usual];
  for (const c of manual) ranges = subtract(ranges, [toMinutes(c.from!), toMinutes(c.to!)]);
  const touched = ranges.length !== 1 || ranges[0][0] !== usual[0] || ranges[0][1] !== usual[1];
  return { ranges, reason: touched ? label(manual[0]) : null, partial: touched && ranges.length > 0 };
}

/** Délai (en minutes) en deçà duquel le studio « ouvre bientôt » ou « ferme bientôt » */
export const SOON = 60;

export type State = 'open' | 'closing-soon' | 'opening-soon' | 'closed';

const LABELS: Record<State, string> = {
  open: 'Ouvert',
  'closing-soon': 'Ferme bientôt',
  'opening-soon': 'Ouvre bientôt',
  closed: 'Fermé',
};

/** État du studio, sans heure affichée : « Ouvert », « Ferme bientôt », « Ouvre bientôt » ou « Fermé » */
export function getStatus(cal: Calendar, now = new Date()) {
  const { date, minutes } = parisNow(now);
  const { ranges } = dayOn(date, cal);
  const current = ranges.find(([a, b]) => minutes >= a && minutes < b);
  const state: State = current
    ? current[1] - minutes <= SOON ? 'closing-soon' : 'open'
    : ranges.some(([a]) => a > minutes && a - minutes <= SOON) ? 'opening-soon' : 'closed';
  return { date, minutes, state, label: LABELS[state] };
}

/** Calendrier du studio : horaires de src/data/site.ts + fermetures enregistrées dans l'administration */
export function buildCalendar(
  schedule: { hours: [string, string] | null }[],
  settings: { closures: Closure[]; holidays: boolean },
): Calendar {
  return {
    slots: schedule.map((d) => (d.hours ? [toMinutes(d.hours[0]), toMinutes(d.hours[1])] : null)),
    closures: settings.closures,
    holidays: settings.holidays,
  };
}
