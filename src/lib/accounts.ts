// Comptes et sessions, dans la même base Upstash Redis que le reste du site (src/lib/store.ts).
// Rôles : client, admin, admin+ (admin_plus : développeurs qui répartissent et chiffrent les projets) et dirigeant.
// Les comptes de l'équipe sont créés par les dirigeants ; le tout premier dirigeant est créé avec SITE_PASSWORD.
// Mots de passe : jamais stockés en clair, seulement leur empreinte scrypt (sel aléatoire par compte).
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { redis, text } from './store';
import { mailEnabled, sendMail } from './forms';

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export type Role = 'client' | 'admin' | 'admin_plus' | 'dirigeant';
export const STAFF_ROLES: Role[] = ['admin', 'admin_plus', 'dirigeant'];
export const ROLE_LABELS: Record<Role, string> = {
  client: 'Client',
  admin: 'Admin',
  admin_plus: 'Admin+',
  dirigeant: 'Dirigeant',
};
export const isRole = (value: unknown): value is Role => typeof value === 'string' && value in ROLE_LABELS;

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
  /** Compte désactivé : plus de connexion possible, ses sessions sont refusées */
  disabled?: boolean;
  /** Client : adresse confirmée par le lien envoyé par e-mail (exigé dès que l'envoi d'e-mails est configuré) */
  emailVerified?: boolean;
};
/** Compte tel qu'il circule dans les pages : sans l'empreinte du mot de passe */
export type PublicUser = Omit<User, 'passwordHash'>;

export const isStaff = (user: PublicUser | null | undefined): boolean => Boolean(user && STAFF_ROLES.includes(user.role));

/** Ce que chaque rôle peut faire dans le portail de l'équipe (/administration) */
export const can = {
  /** État du site, adresse du siège, fermetures, offres d'emploi, comptes de l'équipe */
  manageSite: (user: PublicUser | null) => user?.role === 'dirigeant',
  /** Liste des devis (les dirigeants n'en voient que le résumé) */
  viewQuotes: (user: PublicUser | null) => isStaff(user),
  /** Détail complet d'un devis (coordonnées du client, lignes, fourchettes) */
  readQuoteDetails: (user: PublicUser | null) => user?.role === 'admin' || user?.role === 'admin_plus',
  /** Attribuer un devis à un admin+, supprimer un devis */
  assignQuotes: (user: PublicUser | null) => user?.role === 'admin_plus',
  /** Fixer les prix : seulement l'admin+ à qui le devis est attribué */
  editQuote: (user: PublicUser | null, assigneeId: string | undefined) =>
    user?.role === 'admin_plus' && Boolean(assigneeId) && assigneeId === user.id,
};

export const MIN_PASSWORD = 10;
const SESSION_DAYS = 30;
/** Après autant d'échecs sur une même adresse, la connexion est bloquée 15 minutes */
const MAX_FAILURES = 8;

const KEYS = {
  user: (id: string) => `nf:user:${id}`,
  email: (email: string) => `nf:user-email:${email}`,
  index: 'nf:users',
  session: (token: string) => `nf:session:${token}`,
  verify: (token: string) => `nf:verify:${token}`,
  signupRate: (client: string) => `nf:signup-rate:${client}`,
  failures: (email: string) => `nf:login-fail:${createHash('sha256').update(email).digest('hex').slice(0, 24)}`,
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
const strip = ({ passwordHash: _hash, ...user }: User): PublicUser => user;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

async function loadUser(id: string): Promise<User | null> {
  const [raw] = await redis([['GET', KEYS.user(id)]]);
  const saved = text(raw);
  return saved ? JSON.parse(saved) : null;
}

export async function getUser(id: string): Promise<PublicUser | null> {
  const user = await loadUser(id);
  return user ? strip(user) : null;
}

/** Tous les comptes, du plus récent au plus ancien */
export async function listUsers(): Promise<PublicUser[]> {
  const [ids] = await redis([['ZREVRANGE', KEYS.index, '0', '-1']]);
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const keys = ids.filter((id): id is string => typeof id === 'string');
  const [raw] = await redis([['MGET', ...keys.map(KEYS.user)]]);
  return (Array.isArray(raw) ? raw : [])
    .filter((v): v is string => typeof v === 'string')
    .map((v) => strip(JSON.parse(v)));
}

/** true dès qu'un compte de l'équipe existe (sinon, le premier dirigeant peut être créé avec SITE_PASSWORD) */
export async function hasStaff(): Promise<boolean> {
  return (await listUsers()).some((user) => STAFF_ROLES.includes(user.role));
}

/** Crée le compte, ou renvoie 'pris' si l'adresse e-mail a déjà un compte */
export async function createUser(input: {
  email: string;
  name: string;
  role: Role;
  password: string;
  emailVerified?: boolean;
}): Promise<PublicUser | 'pris'> {
  const email = normalizeEmail(input.email);
  const id = crypto.randomUUID().replace(/-/g, '');
  const [reserved] = await redis([['SET', KEYS.email(email), id, 'NX']]);
  if (reserved === null) return 'pris';
  const user: User = {
    id,
    email,
    name: input.name.trim(),
    role: input.role,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
    ...(input.emailVerified !== undefined ? { emailVerified: input.emailVerified } : {}),
  };
  await redis([
    ['SET', KEYS.user(id), JSON.stringify(user)],
    ['ZADD', KEYS.index, String(Date.now()), id],
  ]);
  return strip(user);
}

/** Modifie le rôle, le nom, l'état ou le mot de passe (en clair, il est aussitôt remplacé par son empreinte) */
export async function updateUser(
  id: string,
  changes: Partial<Pick<User, 'name' | 'role' | 'disabled' | 'emailVerified'>> & { password?: string },
): Promise<void> {
  const user = await loadUser(id);
  if (!user) return;
  const { password, ...rest } = changes;
  const next: User = { ...user, ...rest, ...(password ? { passwordHash: await hashPassword(password) } : {}) };
  await redis([['SET', KEYS.user(id), JSON.stringify(next)]]);
}

/**
 * Change l'adresse e-mail de connexion. La nouvelle adresse est réservée d'abord (comme à la création), puis
 * l'ancienne est libérée. 'pris' : un autre compte utilise déjà cette adresse.
 */
export async function changeEmail(id: string, emailInput: string): Promise<'ok' | 'pris' | 'inconnu'> {
  const user = await loadUser(id);
  if (!user) return 'inconnu';
  const email = normalizeEmail(emailInput);
  if (email === user.email) return 'ok';
  const [reserved] = await redis([['SET', KEYS.email(email), id, 'NX']]);
  if (reserved === null) return 'pris';
  await redis([
    ['SET', KEYS.user(id), JSON.stringify({ ...user, email })],
    ['DEL', KEYS.email(user.email)],
  ]);
  return 'ok';
}

/** Supprime le compte (à la demande du client) : il ne peut plus se connecter, son adresse redevient libre */
export async function deleteUser(id: string): Promise<void> {
  const user = await loadUser(id);
  if (!user) return;
  await redis([
    ['DEL', KEYS.user(id)],
    ['DEL', KEYS.email(user.email)],
    ['ZREM', KEYS.index, id],
  ]);
}

/** Inscriptions : 5 par heure au plus depuis une même adresse IP (empreinte, voir clientKey) */
export async function allowSignup(client: string): Promise<boolean> {
  const [count] = await redis([
    ['INCR', KEYS.signupRate(client)],
    ['EXPIRE', KEYS.signupRate(client), '3600'],
  ]);
  return Number(count) <= 5;
}

/**
 * Envoie le lien de confirmation de l'adresse e-mail (valable 48 h). false : envoi d'e-mails non configuré ou refusé.
 * origin : adresse du site (Astro.url.origin), pour construire le lien.
 */
export async function sendConfirmation(user: PublicUser, origin: string): Promise<boolean> {
  if (!mailEnabled()) return false;
  const token = randomBytes(32).toString('base64url');
  await redis([['SET', KEYS.verify(token), JSON.stringify({ id: user.id, email: user.email }), 'EX', String(48 * 3600)]]);
  return sendMail({
    to: user.email,
    subject: 'Confirmez votre adresse e-mail · NovaForge Studio',
    text: [
      `Bonjour ${user.name},`,
      '',
      'Pour activer votre compte NovaForge Studio, confirmez votre adresse e-mail en ouvrant ce lien (valable 48 heures) :',
      `${origin}/confirmation?jeton=${token}`,
      '',
      "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.",
    ].join('\n'),
  });
}

/** Renvoie le lien de confirmation, une fois toutes les 10 minutes au plus par compte ('recent' sinon) */
export async function resendConfirmation(user: PublicUser, origin: string): Promise<boolean | 'recent'> {
  const [fresh] = await redis([['SET', `nf:verify-sent:${user.id}`, '1', 'EX', '600', 'NX']]);
  if (fresh === null) return 'recent';
  return sendConfirmation(user, origin);
}

/** Confirme l'adresse du lien ; null si le lien est inconnu, expiré, ou si l'adresse du compte a changé depuis */
export async function confirmEmail(token: string): Promise<PublicUser | null> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const [raw] = await redis([['GET', KEYS.verify(token)]]);
  const saved = text(raw);
  if (!saved) return null;
  const { id, email } = JSON.parse(saved) as { id: string; email: string };
  const user = await loadUser(id);
  if (!user || user.email !== email) return null;
  await redis([
    ['SET', KEYS.user(id), JSON.stringify({ ...user, emailVerified: true })],
    ['DEL', KEYS.verify(token)],
  ]);
  return strip({ ...user, emailVerified: true });
}

/** Client dont l'adresse doit encore être confirmée avant de se connecter (seulement si l'envoi d'e-mails marche) */
export const needsConfirmation = (user: PublicUser) => user.role === 'client' && !user.emailVerified && mailEnabled();

/**
 * Vérifie l'adresse et le mot de passe ; 'bloque' après trop d'échecs récents sur cette adresse.
 * Un compte désactivé est refusé comme un mauvais mot de passe.
 */
export async function authenticate(emailInput: string, password: string): Promise<PublicUser | null | 'bloque'> {
  const email = normalizeEmail(emailInput);
  const [failures, id] = await redis([
    ['GET', KEYS.failures(email)],
    ['GET', KEYS.email(email)],
  ]);
  if (Number(failures) >= MAX_FAILURES) return 'bloque';
  const user = typeof id === 'string' ? await loadUser(id) : null;
  if (user && !user.disabled && (await verifyPassword(password, user.passwordHash))) {
    await redis([['DEL', KEYS.failures(email)]]);
    return strip(user);
  }
  await redis([
    ['INCR', KEYS.failures(email)],
    ['EXPIRE', KEYS.failures(email), '900'],
  ]);
  return null;
}

export async function checkUserPassword(id: string, password: string): Promise<boolean> {
  const user = await loadUser(id);
  return Boolean(user && (await verifyPassword(password, user.passwordHash)));
}

/** Ouvre une session : jeton aléatoire, gardé SESSION_DAYS jours */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await redis([['SET', KEYS.session(token), userId, 'EX', String(SESSION_DAYS * 86_400)]]);
  return token;
}

/** Compte de la session, ou null (session inconnue, expirée, ou compte désactivé) */
export async function sessionUser(token: string): Promise<PublicUser | null> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const [id] = await redis([['GET', KEYS.session(token)]]);
  const user = typeof id === 'string' ? await getUser(id) : null;
  return user && !user.disabled ? user : null;
}

export async function deleteSession(token: string): Promise<void> {
  await redis([['DEL', KEYS.session(token)]]);
}

export const SESSION_MAX_AGE = SESSION_DAYS * 86_400;
