// Candidatures (fiches de poste et candidature spontanée) : envoi par e-mail, CV en pièce jointe
import type { APIRoute } from 'astro';
import { site } from '../../data/site';
import { field, isEmail, isUrl, mailEnabled, oneLine, readForm, reply, sendMail } from '../../lib/forms';

// Vercel limite le corps d'une requête à 4,5 Mo : le CV doit rester en dessous
const MAX_CV_SIZE = 4 * 1024 * 1024;
const CV_EXTENSIONS = ['pdf', 'doc', 'docx'];

export const POST: APIRoute = async ({ request }) => {
  const data = await readForm(request);
  if (!data) return reply.invalid();
  // Champ invisible rempli : c'est un robot, on fait comme si tout allait bien
  if (field(data, 'site_web')) return reply.ok();

  const prenom = field(data, 'prenom', 80);
  const nom = field(data, 'nom', 80);
  const email = field(data, 'email', 160);
  const telephone = field(data, 'telephone', 40);
  const poste = field(data, 'poste', 160) || 'Candidature spontanée';
  const contrat = field(data, 'contrat', 80);
  const lien = field(data, 'lien', 300);
  const linkedin = field(data, 'linkedin', 300);
  const message = field(data, 'message', 5000);
  const disponibilite = field(data, 'disponibilite', 80);
  const source = field(data, 'source', 80);
  const cv = data.get('cv');

  const extension = cv instanceof File ? (cv.name.split('.').pop() ?? '').toLowerCase() : '';
  const cvValid = cv instanceof File && cv.size > 0 && cv.size <= MAX_CV_SIZE && CV_EXTENSIONS.includes(extension);

  if (
    !prenom ||
    !nom ||
    !isEmail(email) ||
    !contrat ||
    !isUrl(lien) ||
    (linkedin && !isUrl(linkedin)) ||
    !message ||
    !cvValid ||
    !data.get('consentement')
  ) {
    return reply.invalid();
  }
  if (!mailEnabled()) return reply.unavailable();

  const sent = await sendMail({
    to: site.jobsEmail,
    replyTo: email,
    subject: oneLine(`Candidature · ${poste} · ${prenom} ${nom}`),
    text: [
      `Poste : ${poste}`,
      `Contrat souhaité : ${contrat}`,
      '',
      `Nom : ${prenom} ${nom}`,
      `E-mail : ${email}`,
      `Téléphone : ${telephone || '—'}`,
      `Portfolio / GitHub : ${lien}`,
      `LinkedIn : ${linkedin || '—'}`,
      `Disponibilité : ${disponibilite || '—'}`,
      `Nous a connus par : ${source || '—'}`,
      '',
      message,
      '',
      '— CV en pièce jointe · envoyé depuis le site',
    ].join('\n'),
    attachments: [
      {
        filename: oneLine(`CV ${prenom} ${nom}.${extension}`),
        content: Buffer.from(await (cv as File).arrayBuffer()).toString('base64'),
      },
    ],
  });

  return sent ? reply.ok() : reply.failed();
};
