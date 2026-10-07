/* ==========================================================================
   NovaForge Studio — interactions (chargé sur toutes les pages)
   ========================================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- En-tête : fond au défilement ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Menu mobile ---------- */
const navToggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const nav = document.querySelector<HTMLElement>('[data-nav]');
if (navToggle && nav) {
  const label = navToggle.querySelector('.sr-only');
  const isOpen = () => document.body.classList.contains('nav-open');
  const setNav = (open: boolean) => {
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
  };

  navToggle.addEventListener('click', () => setNav(!isOpen()));
  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setNav(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setNav(false);
      navToggle.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) setNav(false);
  });
}

/* ---------- Apparition des blocs au défilement ---------- */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

/* ---------- Filtres des réalisations ---------- */
const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
if (filterButtons.length) {
  const projectCards = document.querySelectorAll<HTMLElement>('[data-category]');
  const status = document.querySelector('[data-filter-status]');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      let shown = 0;
      projectCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.hidden = !match;
        if (match) {
          shown += 1;
          card.classList.add('is-visible');
        }
      });
      if (status) status.textContent = `${shown} projet${shown > 1 ? 's' : ''} affiché${shown > 1 ? 's' : ''}`;
    });
  });
}

/* ---------- Formulaires (validation dans le navigateur, aucun envoi réel) ---------- */
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const errorMessage = (control: Control) => {
  const { validity, type } = control;
  if (validity.valueMissing) {
    if (type === 'radio') return 'Choisissez une option.';
    if (type === 'file') return 'Ajoutez votre CV.';
    if (type === 'checkbox') return 'Merci de cocher cette case.';
    return 'Ce champ est obligatoire.';
  }
  if (validity.typeMismatch && type === 'email') return 'Adresse e-mail invalide (ex. nom@domaine.fr).';
  if (validity.typeMismatch && type === 'url') return 'Lien invalide (ex. https://github.com/votre-profil).';
  return 'Valeur invalide.';
};

const validateField = (field: HTMLElement) => {
  const controls = field.querySelectorAll<Control>('input, select, textarea');
  if (!controls.length) return true;
  const valid = controls[0].checkValidity();
  controls.forEach((control) => control.setAttribute('aria-invalid', String(!valid)));
  const error = field.querySelector('.field-error');
  if (error) error.textContent = valid ? '' : errorMessage(controls[0]);
  return valid;
};

/* Formulaire en plusieurs étapes (candidature) */
const initSteps = (form: HTMLFormElement) => {
  const steps = [...form.querySelectorAll<HTMLElement>('[data-step]')];
  const progress = [...form.querySelectorAll<HTMLElement>('[data-progress]')];
  const prev = form.querySelector<HTMLButtonElement>('[data-step-prev]');
  const next = form.querySelector<HTMLButtonElement>('[data-step-next]');
  const submit = form.querySelector<HTMLButtonElement>('[data-step-submit]');
  const status = form.querySelector('[data-step-status]');
  let current = 0;

  const show = (index: number) => {
    current = index;
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    progress.forEach((p, i) => {
      p.classList.toggle('is-active', i === index);
      p.classList.toggle('is-done', i < index);
    });
    if (prev) prev.hidden = index === 0;
    if (next) next.hidden = index === steps.length - 1;
    if (submit) submit.hidden = index !== steps.length - 1;
    const title = steps[index].querySelector<HTMLElement>('.apply-step-title');
    if (status) status.textContent = `Étape ${index + 1} sur ${steps.length} : ${title?.textContent ?? ''}`;
    title?.focus({ preventScroll: true });
    form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const goNext = () => {
    const invalid = [...steps[current].querySelectorAll<HTMLElement>('[data-field]')].filter((f) => !validateField(f));
    if (invalid.length) {
      invalid[0].querySelector<Control>('input, select, textarea')?.focus();
      return;
    }
    show(current + 1);
  };

  next?.addEventListener('click', goNext);
  prev?.addEventListener('click', () => show(current - 1));

  return {
    isLast: () => current === steps.length - 1,
    goNext,
    showStepOf: (field: HTMLElement) => {
      const index = steps.findIndex((step) => step.contains(field));
      if (index >= 0 && index !== current) show(index);
    },
    complete: () => {
      form.querySelector<HTMLElement>('[data-apply-body]')?.setAttribute('hidden', '');
      form.querySelector<HTMLElement>('.apply-progress')?.setAttribute('hidden', '');
      const success = form.querySelector<HTMLElement>('[data-apply-success]');
      if (success) {
        success.hidden = false;
        success.focus();
      }
    },
  };
};

/* Envoi au serveur (src/pages/api) ; en cas d'échec, l'adresse e-mail est proposée en secours */
const failureMessages: Record<string, string> = {
  indisponible: "L'envoi en ligne n'est pas encore activé. Écrivez-nous directement à ",
  invalide: 'Certaines informations semblent incomplètes. Vérifiez le formulaire ou écrivez-nous à ',
  verrouille: 'Votre accès au site a expiré : rechargez la page, ou écrivez-nous à ',
  envoi: "L'envoi n'a pas abouti. Réessayez dans un instant ou écrivez-nous à ",
};

const sendForm = async (form: HTMLFormElement, status: Element | null): Promise<boolean> => {
  const buttons = form.querySelectorAll<HTMLButtonElement>('button[type="submit"]');
  buttons.forEach((button) => (button.disabled = true));
  if (status) status.textContent = 'Envoi en cours…';

  let error = 'envoi';
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    const body: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
    error = res.ok && body.ok ? '' : (body.error ?? 'envoi');
  } catch {
    // Réseau indisponible : message générique
  }
  buttons.forEach((button) => (button.disabled = false));

  if (!error) {
    if (status) status.textContent = '';
    return true;
  }
  if (status) {
    const email = form.dataset.email ?? '';
    const link = Object.assign(document.createElement('a'), { href: `mailto:${email}`, textContent: email });
    status.replaceChildren(failureMessages[error] ?? failureMessages.envoi, link, '.');
  }
  return false;
};

document.querySelectorAll<HTMLFormElement>('[data-form]').forEach((form) => {
  const fields = [...form.querySelectorAll<HTMLElement>('[data-field]')];
  const status = form.querySelector('[data-form-status]');
  const stepper = form.hasAttribute('data-steps') ? initSteps(form) : null;
  let submitted = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Touche Entrée avant la dernière étape : on passe simplement à l'étape suivante
    if (stepper && !stepper.isLast()) {
      stepper.goNext();
      return;
    }

    submitted = true;
    const invalid = fields.filter((field) => !validateField(field));

    if (invalid.length) {
      if (status) status.textContent = '';
      stepper?.showStepOf(invalid[0]);
      invalid[0].querySelector<Control>('input, select, textarea')?.focus();
      return;
    }

    if (!(await sendForm(form, status))) return;

    if (stepper) {
      stepper.complete();
      return;
    }

    if (status) status.textContent = form.dataset.success ?? 'Merci !';
    form.reset();
    submitted = false;
    form.querySelectorAll('[aria-invalid]').forEach((control) => control.removeAttribute('aria-invalid'));
    form.querySelectorAll<HTMLElement>('[data-file-name]').forEach((el) => {
      el.textContent = el.dataset.empty ?? '';
    });
  });

  // Après une première tentative, on revalide chaque champ pendant la saisie
  const revalidate = (e: Event) => {
    if (!submitted) return;
    const field = (e.target as HTMLElement).closest<HTMLElement>('[data-field]');
    if (field) validateField(field);
  };
  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);
});

/* ---------- Champ fichier : nom du fichier choisi ---------- */
document.querySelectorAll<HTMLInputElement>('[data-file-input]').forEach((input) => {
  const name = input.parentElement?.querySelector<HTMLElement>('[data-file-name]');
  input.addEventListener('change', () => {
    if (name) name.textContent = input.files?.length ? input.files[0].name : (name.dataset.empty ?? '');
  });
});

/* ---------- Partage d'une offre ---------- */
document.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((button) => {
  const label = button.querySelector('[data-share-label]');
  const initial = label?.textContent ?? '';
  button.addEventListener('click', async () => {
    const url = window.location.href.split('#')[0];
    // Sur mobile : menu de partage natif ; sinon : copie du lien
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: button.dataset.shareTitle, url });
      } catch {
        /* partage annulé */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      if (label) {
        label.textContent = 'Lien copié !';
        window.setTimeout(() => {
          label.textContent = initial;
        }, 2200);
      }
    } catch {
      window.prompt("Copiez le lien de l'offre :", url);
    }
  });
});

/* ---------- Année courante ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

/* ---------- Logo du hero : léger effet de parallaxe ---------- */
const parallax = document.querySelector<HTMLElement>('[data-parallax]');
if (parallax && !reduceMotion) {
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      parallax.style.setProperty('--px', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
      parallax.style.setProperty('--py', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
    },
    { passive: true },
  );
}

/* ---------- Poussière d'étoiles : étoiles scintillantes + particules qui montent ---------- */
type Star = { x: number; y: number; r: number; phase: number; speed: number };
type Dust = { x: number; y: number; vx: number; vy: number; life: number; ttl: number; size: number; hue: number };

const initStardust = (canvas: HTMLCanvasElement) => {
  const host = canvas.closest<HTMLElement>('[data-stardust-host]');
  const ctx = canvas.getContext('2d');
  if (!host || !ctx) return;

  const MAX_DUST = 150;
  const dust: Dust[] = [];
  let stars: Star[] = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  let onScreen = true;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(140, Math.round((width * height) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.03,
    }));
  };

  const spawn = (x: number, y: number, force = 1) => {
    if (dust.length >= MAX_DUST) return;
    dust.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.4 * force,
      vy: -(0.6 + Math.random() * 1.8) * force,
      life: 0,
      ttl: 60 + Math.random() * 110,
      size: 0.6 + Math.random() * 1.6,
      // Étincelles de forge ambrées (comme l'éclairage des locaux), quelques-unes bleues (logo)
      hue: Math.random() < 0.72 ? 26 + Math.random() * 18 : 200 + Math.random() * 14,
    });
  };

  const frame = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    // Étoiles fixes qui scintillent
    for (const s of stars) {
      s.phase += s.speed;
      ctx.fillStyle = `rgba(255, 238, 214, ${0.15 + (Math.sin(s.phase) + 1) * 0.28})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Particules qui montent depuis le bas (le « foyer » de la forge)
    if (Math.random() < 0.7) spawn(width * (0.05 + Math.random() * 0.9), height + 4);
    ctx.lineCap = 'round';
    for (let i = dust.length - 1; i >= 0; i -= 1) {
      const d = dust[i];
      d.vx += (Math.random() - 0.5) * 0.08;
      d.vy -= 0.006;
      d.x += d.vx;
      d.y += d.vy;
      d.life += 1;
      const t = d.life / d.ttl;
      if (t >= 1) {
        dust.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `hsla(${d.hue}, 95%, ${62 + (1 - t) * 20}%, ${(1 - t) * 0.85})`;
      ctx.lineWidth = d.size;
      ctx.beginPath();
      ctx.moveTo(d.x - d.vx * 3, d.y - d.vy * 3);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }

    rafId = requestAnimationFrame(frame);
  };

  const start = () => {
    if (!rafId && onScreen && !document.hidden) rafId = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  // Le curseur sème des particules, un clic en projette une gerbe
  const pointerPos = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top] as const;
  };
  host.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const [x, y] = pointerPos(e);
    spawn(x, y, 0.5);
  });
  host.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea, label')) return;
    const [x, y] = pointerPos(e);
    for (let i = 0; i < 24; i += 1) spawn(x, y, 1.6);
  });

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) start();
    else stop();
  }).observe(host);

  start();
};

if (!reduceMotion) {
  document.querySelectorAll<HTMLCanvasElement>('[data-stardust]').forEach(initStardust);
}
