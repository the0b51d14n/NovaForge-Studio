// Horaires d'ouverture : conversions et état « ouvert / fermé », toujours à l'heure de Paris

/** Créneau d'une journée en minutes depuis minuit, `null` = fermé */
export type Slot = [number, number] | null;

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

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Jour (0 = lundi) et minutes écoulées depuis minuit, à Paris (le serveur peut tourner dans un autre fuseau) */
export function parisNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { day: WEEKDAYS.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** État du studio : « Ouvert · ferme à 18 h » ou « Fermé · ouvre lundi à 9 h » */
export function getStatus(slots: Slot[], names: string[], date = new Date()) {
  const { day, minutes } = parisNow(date);
  const today = slots[day];
  if (today && minutes >= today[0] && minutes < today[1]) {
    return { day, minutes, open: true, label: `Ouvert · ferme à ${formatTime(today[1])}` };
  }
  // Prochaine ouverture : plus tard aujourd'hui, ou l'un des 7 jours suivants
  for (let k = 0; k <= 7; k++) {
    const d = (day + k) % 7;
    const slot = slots[d];
    if (!slot || (k === 0 && minutes >= slot[0])) continue;
    const when = k === 0 ? '' : k === 1 ? ' demain' : ` ${names[d].toLowerCase()}`;
    return { day, minutes, open: false, label: `Fermé · ouvre${when} à ${formatTime(slot[0])}` };
  }
  return { day, minutes, open: false, label: 'Fermé' };
}
