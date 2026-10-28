// Tampon de la dernière modification enregistrée dans l'administration : interrogé toutes les quelques
// secondes par les pages ouvertes (src/scripts/live.ts), qui se rechargent quand il change.
// Mis en cache 1 s sur le CDN de Vercel : quel que soit le nombre de visiteurs, la base n'est lue
// qu'une fois par seconde au plus, ce qui protège le quota gratuit d'Upstash.
import type { APIRoute } from 'astro';
import { readVersion } from '../../lib/store';

export const GET: APIRoute = async () => {
  try {
    return Response.json(
      { version: await readVersion() },
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=1' } },
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'indisponible' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
