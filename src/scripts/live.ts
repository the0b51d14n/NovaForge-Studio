// Rafraîchissement automatique : quand une modification est enregistrée dans l'administration
// (verrou, adresse, fermetures, offres), les pages ouvertes se rechargent d'elles-mêmes.
// Vérification toutes les 30 s, seulement quand l'onglet est visible. Si le visiteur a commencé à remplir
// un formulaire, on ne recharge pas : un bandeau lui propose d'actualiser quand il le souhaite.
const meta = document.querySelector<HTMLMetaElement>('meta[name="nf-version"]');
const INTERVAL = 30_000;
// Garde-fou contre une boucle : on ne recharge qu'une fois pour une même version
const RELOAD_KEY = 'nf-live-reload';

if (meta) {
  const current = meta.content;
  let dirty = false;
  let notified = false;

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
    if (document.hidden || notified) return;
    try {
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (!res.ok) return;
      const { version } = (await res.json()) as { version: string };
      if (version === current) return;
      if (dirty || !reload(version)) notify();
    } catch {
      // Hors ligne ou serveur injoignable : on réessaiera au prochain passage
    }
  };

  setInterval(check, INTERVAL);
  // Retour sur l'onglet : vérification immédiate plutôt qu'attendre le prochain passage
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) check();
  });
}
