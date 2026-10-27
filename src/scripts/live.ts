// Rafraîchissement automatique : quand une modification est enregistrée dans l'administration
// (verrou, adresse, fermetures, offres), les pages ouvertes se rechargent d'elles-mêmes en quelques secondes.
// Vérification toutes les 3 s tant que le visiteur est actif, toutes les 30 s après 2 min sans activité,
// jamais quand l'onglet est caché (vérification immédiate au retour). Si le visiteur a commencé à remplir
// un formulaire, on ne recharge pas : un bandeau lui propose d'actualiser quand il le souhaite.
const meta = document.querySelector<HTMLMetaElement>('meta[name="nf-version"]');
const FAST = 3_000;
const SLOW = 30_000;
const IDLE = 2 * 60_000;
// Garde-fou contre une boucle : on ne recharge qu'une fois pour une même version
const RELOAD_KEY = 'nf-live-reload';

if (meta) {
  const current = meta.content;
  let dirty = false;
  let notified = false;
  let busy = false;
  let lastActivity = Date.now();
  let timer = 0;

  document.addEventListener('input', () => (dirty = true));

  const reload = (version: string) => {
    try {
      // Déjà rechargé pour cette version sans l'obtenir : on n'insiste pas, le bandeau prend le relais
      if (sessionStorage.getItem(RELOAD_KEY) === version) return false;
      sessionStorage.setItem(RELOAD_KEY, version);
    } catch {
      // Stockage indisponible (navigation privée stricte) : on recharge quand même
    }
    location.reload();
    return true;
  };

  const notify = () => {
    if (notified) return;
    notified = true;
    const bar = document.createElement('div');
    bar.className = 'live-notice surface-dark';
    bar.setAttribute('role', 'status');
    bar.innerHTML =
      '<p>Le site vient d’être mis à jour.</p><button class="btn btn-primary btn-sm" type="button">Actualiser</button>';
    bar.querySelector('button')?.addEventListener('click', () => location.reload());
    document.body.append(bar);
  };

  const check = async () => {
    if (document.hidden || notified || busy) return;
    busy = true;
    try {
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (!res.ok) return;
      const { version } = (await res.json()) as { version: string };
      if (version === current) return;
      if (dirty || !reload(version)) notify();
    } catch {
      // Hors ligne ou serveur injoignable : on réessaiera au prochain passage
    } finally {
      busy = false;
    }
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = window.setTimeout(async () => {
      await check();
      schedule();
    }, Date.now() - lastActivity > IDLE ? SLOW : FAST);
  };

  // Activité du visiteur : repasse au rythme rapide (et vérifie tout de suite s'il était inactif)
  const onActivity = () => {
    const wasIdle = Date.now() - lastActivity > IDLE;
    lastActivity = Date.now();
    if (wasIdle) {
      check();
      schedule();
    }
  };
  for (const type of ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart']) {
    window.addEventListener(type, onActivity, { passive: true });
  }

  // Retour sur l'onglet ou la fenêtre : vérification immédiate plutôt qu'attendre le prochain passage
  const onReturn = () => {
    if (document.hidden) return;
    lastActivity = Date.now();
    check();
    schedule();
  };
  document.addEventListener('visibilitychange', onReturn);
  window.addEventListener('focus', onReturn);
  // Retour arrière depuis le cache du navigateur : la page peut être ancienne
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) onReturn();
  });

  schedule();
}
