import type { APIRoute } from 'astro';
import { createSessionCookie, cookieName, validateCredentials } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const contentType = request.headers.get('content-type') || '';
	let username = '';
	let password = '';

	if (contentType.includes('application/json')) {
		const body = await request.json().catch(() => ({}));
		username = String(body.username ?? body.user ?? '').trim();
		password = String(body.password ?? '').trim();
	} else {
		const formData = await request.formData().catch(() => null);
		if (formData) {
			username = String(formData.get('username') ?? formData.get('user') ?? '').trim();
			password = String(formData.get('password') ?? '').trim();
		}
	}

	if (!username || !password) {
		return new Response(JSON.stringify({ success: false, error: 'Usuario y contraseña requeridos' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		if (!validateCredentials(username, password)) {
			return new Response(JSON.stringify({ success: false, error: 'Credenciales incorrectas' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const value = createSessionCookie();
		const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
		const cookie = `${cookieName()}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${import.meta.env.PROD ? '; Secure' : ''}`;

		if (contentType.includes('application/json')) {
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Set-Cookie': cookie,
				},
			});
		}

		return new Response(null, {
			status: 302,
			headers: { Location: '/panel', 'Set-Cookie': cookie },
		});
	} catch (e) {
		console.error('Login error', e);
		return new Response(JSON.stringify({ success: false, error: 'Error de configuración' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
