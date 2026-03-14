import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
	const secret = import.meta.env.SESSION_SECRET;
	if (!secret || typeof secret !== 'string') throw new Error('SESSION_SECRET is not set');
	return secret;
}

function getCredentials(): { user: string; password: string } {
	const user = import.meta.env.LOGIN_USER;
	const password = import.meta.env.LOGIN_PASSWORD;
	if (!user || !password) throw new Error('LOGIN_USER and LOGIN_PASSWORD must be set');
	return { user: String(user), password: String(password) };
}

export function createSessionCookie(): string {
	const secret = getSecret();
	const payload = JSON.stringify({
		user: getCredentials().user,
		exp: Date.now() + MAX_AGE_MS,
	});
	const b64 = Buffer.from(payload, 'utf8').toString('base64url');
	const sig = createHmac('sha256', secret).update(b64).digest('base64url');
	return `${b64}.${sig}`;
}

export function verifySessionCookie(cookieHeader: string | null): { user: string } | null {
	if (!cookieHeader) return null;
	const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
	const value = match?.[1]?.trim();
	if (!value) return null;
	const [b64, sig] = value.split('.');
	if (!b64 || !sig) return null;
	try {
		const secret = getSecret();
		const expected = createHmac('sha256', secret).update(b64).digest('base64url');
		if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))) return null;
		const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
		if (payload.exp && Date.now() > payload.exp) return null;
		return { user: payload.user };
	} catch {
		return null;
	}
}

export function getSessionFromRequest(request: Request): { user: string } | null {
	const cookieHeader = request.headers.get('cookie');
	return verifySessionCookie(cookieHeader);
}

export function cookieName(): string {
	return COOKIE_NAME;
}

export function validateCredentials(username: string, password: string): boolean {
	const { user, password: expected } = getCredentials();
	return username === user && password === expected;
}
