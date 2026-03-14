import type { APIRoute } from 'astro';
import { getSessionFromRequest } from '../../../lib/auth';

export const prerender = false;

const JOTFORM_API_KEY = import.meta.env.JOTFORM_API_KEY;

export const POST: APIRoute = async ({ request }) => {
	const session = getSessionFromRequest(request);
	if (!session) {
		return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	let ids: string[] = [];
	try {
		const body = await request.json().catch(() => ({}));
		ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string' && id) : [];
	} catch {
		return new Response(JSON.stringify({ success: false, error: 'Cuerpo inválido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (ids.length === 0) {
		return new Response(JSON.stringify({ success: true, deleted: 0 }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (!JOTFORM_API_KEY) {
		return new Response(JSON.stringify({ success: false, error: 'JOTFORM_API_KEY no configurada' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const errors: string[] = [];
	let deleted = 0;

	for (const id of ids) {
		try {
			const res = await fetch(
				`https://api.jotform.com/submission/${encodeURIComponent(id)}?apiKey=${encodeURIComponent(JOTFORM_API_KEY)}`,
				{ method: 'DELETE' },
			);
			if (res.ok) {
				deleted++;
			} else {
				const text = await res.text();
				errors.push(`${id}: ${res.status} ${text.slice(0, 80)}`);
			}
		} catch (e) {
			errors.push(`${id}: ${e instanceof Error ? e.message : 'Error'}`);
		}
	}

	return new Response(
		JSON.stringify({
			success: errors.length === 0,
			deleted,
			...(errors.length > 0 && { errors }),
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		},
	);
};
