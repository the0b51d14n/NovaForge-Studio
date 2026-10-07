// Formulaires du site : lecture des champs et envoi par e-mail via l'API Resend (https://resend.com).
// Inactif tant que RESEND_API_KEY et MAIL_FROM ne sont pas configurés : les formulaires invitent
// alors le visiteur à écrire directement à l'adresse de contact.
import { MAIL_FROM, RESEND_API_KEY } from 'astro:env/server';

export type Attachment = { filename: string; content: string /* base64 */ };

type Mail = { to: string; replyTo?: string; subject: string; text: string; attachments?: Attachment[] };

export const mailEnabled = (): boolean => Boolean(RESEND_API_KEY && MAIL_FROM);

export async function sendMail(mail: Mail): Promise<boolean> {
  if (!RESEND_API_KEY || !MAIL_FROM) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [mail.to],
        reply_to: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
        attachments: mail.attachments,
      }),
    });
    if (!res.ok) console.error(`Envoi d'e-mail refusé (${res.status}) :`, await res.text());
    return res.ok;
  } catch (error) {
    console.error("Envoi d'e-mail impossible :", error);
    return false;
  }
}

/** Valeur texte d'un champ, nettoyée et limitée en longueur */
export const field = (data: FormData, name: string, max = 200): string =>
  String(data.get(name) ?? '').trim().slice(0, max);

/** Sur une seule ligne (objet d'e-mail) */
export const oneLine = (value: string): string => value.replace(/\s+/g, ' ');

export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isUrl = (value: string): boolean => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** Lit le corps du formulaire ; null si la requête n'en contient pas */
export async function readForm(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

/**
 * Réponses communes. `error` est lu par src/scripts/main.ts :
 * 'invalide' (champs), 'indisponible' (envoi non configuré), 'envoi' (échec du service)
 */
export const reply = {
  ok: () => Response.json({ ok: true }),
  invalid: () => Response.json({ error: 'invalide' }, { status: 400 }),
  unavailable: () => Response.json({ error: 'indisponible' }, { status: 503 }),
  failed: () => Response.json({ error: 'envoi' }, { status: 502 }),
};
