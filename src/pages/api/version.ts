// Empreinte des données de l'administration : interrogée régulièrement par les pages ouvertes
// (src/scripts/live.ts), qui se rechargent quand elle change. Toujours accessible, même site verrouillé.
import type { APIRoute } from 'astro';
import { dataVersion } from '../../lib/store';

export const GET: APIRoute = ({ locals }) =>
  Response.json({ version: dataVersion(locals) }, { headers: { 'Cache-Control': 'no-store' } });
