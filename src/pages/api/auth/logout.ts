import type { APIRoute } from 'astro';
import { cookieName } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async () => {
	const cookie = `${cookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
	return new Response(null, {
		status: 302,
		headers: { Location: '/login', 'Set-Cookie': cookie },
	});
};

export const POST: APIRoute = async () => {
	const cookie = `${cookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
	return new Response(null, {
		status: 302,
		headers: { Location: '/login', 'Set-Cookie': cookie },
	});
};
