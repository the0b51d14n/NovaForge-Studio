// Horaires d'ouverture : horaires de la semaine, jours fériés et fermetures exceptionnelles.
// Tout est calculé en dates AAAA-MM-JJ à l'heure de Paris (le serveur peut tourner dans un autre fuseau).

/** Créneau d'une journée en minutes depuis minuit, `null` = fermé */
export type Slot = [number, number] | null;

/** Fermeture exceptionnelle saisie dans l'administration (bornes incluses, format AAAA-MM-JJ) */
export type Closure = { start: string; end: string; reason: string };

/** Ce qu'il faut pour savoir si le studio est ouvert un jour donné */
export type Calendar = {
  /** Horaires de la semaine, du lundi (0) au dimanche (6) */
  slots: Slot[];
  closures: Closure[];
  /** true : fermé automatiquement les jours fériés */
  holidays: boolean;
};

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

/** Motif de la fermeture exceptionnelle d'une date (fermeture saisie ou jour férié), sinon null */
export function closureOn(iso: string, cal: Calendar): string | null {
  const manual = cal.closures.find((c) => c.start <= iso && iso <= c.end);
  if (manual) return manual.reason || 'Fermeture exceptionnelle';
  return cal.holidays ? frenchHolidays(Number(iso.slice(0, 4))).get(iso) ?? null : null;
}

/** Créneau réel d'une date : horaires de la semaine, sauf fermeture exceptionnelle */
export const slotOn = (iso: string, cal: Calendar): Slot => (closureOn(iso, cal) ? null : cal.slots[weekday(iso)]);

/** État du studio : « Ouvert · ferme à 18 h », « Fermé (Toussaint) · ouvre demain à 9 h »… */
export function getStatus(cal: Calendar, now = new Date()) {
  const { date, minutes } = parisNow(now);
  const today = slotOn(date, cal);
  if (today && minutes >= today[0] && minutes < today[1]) {
    return { date, minutes, open: true, label: `Ouvert · ferme à ${formatTime(today[1])}` };
  }
  // Le motif n'est utile que si le studio aurait dû ouvrir ce jour-là
  const reason = cal.slots[weekday(date)] ? closureOn(date, cal) : null;
  const closed = reason ? `Fermé (${reason})` : 'Fermé';
  // Prochaine ouverture : plus tard aujourd'hui, ou dans l'année (vacances comprises)
  for (let k = 0; k <= 366; k++) {
    const iso = addDays(date, k);
    const slot = slotOn(iso, cal);
    if (!slot || (k === 0 && minutes >= slot[0])) continue;
    const when =
      k === 0 ? '' : k === 1 ? ' demain' : k < 7 ? ` ${formatDay(iso, { weekday: 'long' })}` : ` le ${formatDay(iso)}`;
    return { date, minutes, open: false, label: `${closed} · ouvre${when} à ${formatTime(slot[0])}` };
  }
  return { date, minutes, open: false, label: closed };
}

/** Fermetures à venir d'ici `days` jours : fermetures saisies, puis jours fériés tombant un jour normalement ouvert */
export function upcomingClosures(cal: Calendar, from: string, days = 120): Closure[] {
  const until = addDays(from, days);
  const list = cal.closures
    .filter((c) => c.end >= from && c.start <= until)
    .map((c) => ({ ...c, reason: c.reason || 'Fermeture exceptionnelle' }));
  if (cal.holidays) {
    for (let k = 0; k < days; k++) {
      const iso = addDays(from, k);
      const name = frenchHolidays(Number(iso.slice(0, 4))).get(iso);
      if (name && cal.slots[weekday(iso)] && !list.some((c) => c.start <= iso && iso <= c.end)) {
        list.push({ start: iso, end: iso, reason: name });
      }
    }
  }
  return list.sort((a, b) => a.start.localeCompare(b.start));
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
