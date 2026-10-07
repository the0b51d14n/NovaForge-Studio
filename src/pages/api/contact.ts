// Formulaire de contact (page /contact) : envoi par e-mail à l'adresse de contact
import type { APIRoute } from 'astro';
import { site } from '../../data/site';
import { field, isEmail, mailEnabled, oneLine, readForm, reply, sendMail } from '../../lib/forms';

export const POST: APIRoute = async ({ request }) => {
  const data = await readForm(request);
  if (!data) return reply.invalid();
  // Champ invisible rempli : c'est un robot, on fait comme si tout allait bien
  if (field(data, 'site_web')) return reply.ok();

  const nom = field(data, 'nom', 120);
  const email = field(data, 'email', 160);
  const entreprise = field(data, 'entreprise', 160);
  const telephone = field(data, 'telephone', 40);
  const type = field(data, 'type', 80);
  const budget = field(data, 'budget', 80);
  const message = field(data, 'message', 5000);

  if (!nom || !isEmail(email) || !message || !data.get('consentement')) return reply.invalid();
  if (!mailEnabled()) return reply.unavailable();

  const sent = await sendMail({
    to: site.email,
    replyTo: email,
    subject: oneLine(`Nouveau projet : ${nom}${entreprise ? ` (${entreprise})` : ''}`),
    text: [
      `Nom : ${nom}`,
      `E-mail : ${email}`,
      `Entreprise : ${entreprise || '—'}`,
      `Téléphone : ${telephone || '—'}`,
      `Type de projet : ${type || '—'}`,
      `Budget estimé : ${budget || '—'}`,
      '',
      message,
      '',
      '— Envoyé depuis le formulaire de contact du site',
    ].join('\n'),
  });

  return sent ? reply.ok() : reply.failed();
};
