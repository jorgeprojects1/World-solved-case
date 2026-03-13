import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

function getFormValues(
	get: (key: string) => string | null,
): Record<string, string> {
	return {
		firstName: (get('firstName') || '') as string,
		lastName: (get('lastName') || '') as string,
		country: (get('country') || '') as string,
		address: (get('address') || '') as string,
		identificationNumber: (get('identificationNumber') || '') as string,
		phone: (get('phone') || '') as string,
		email: (get('email') || '') as string,
		city: (get('city') || '') as string,
		bankName: (get('bankName') || '') as string,
		accountNumber: (get('accountNumber') || '') as string,
		swiftCode: (get('swiftCode') || '') as string,
		bankAddress: (get('bankAddress') || '') as string,
		investedAmount: (get('investedAmount') || '') as string,
		amountToRecover: (get('amountToRecover') || '') as string,
		message: (get('message') || '') as string,
	};
}

export const POST: APIRoute = async ({ request }) => {
	const contentType = request.headers.get('content-type') || '';

	let values: Record<string, string>;
	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData();
		values = getFormValues((key) => formData.get(key) as string | null);
	} else {
		// application/x-www-form-urlencoded (or missing): parse body as URL-encoded
		const text = await request.text();
		if (!text || text.length === 0) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Request body is empty. Ensure the form uses method="POST" and enctype="application/x-www-form-urlencoded".',
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}
		const params = new URLSearchParams(text);
		values = getFormValues((key) => params.get(key));
	}

	const {
		firstName,
		lastName,
		country,
		address,
		identificationNumber,
		phone,
		email,
		city,
		bankName,
		accountNumber,
		swiftCode,
		bankAddress,
		investedAmount,
		amountToRecover,
		message,
	} = values;

	const textBody = `
New subscription form submission:

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Country: ${country}
City: ${city}
Address: ${address}
Identification number: ${identificationNumber}

Bank name: ${bankName}
Account number: ${accountNumber}
Bank SWIFT code: ${swiftCode}
Bank address: ${bankAddress}

Invested amount: ${investedAmount}
Amount to recover: ${amountToRecover}

Message:
${message}
`.trim();

	const { data, error } = await resend.emails.send({
		from: 'World Solved Case <onboarding@resend.dev>',
		to: 'jorgeprojects1@gmail.com',
		subject: 'New subscription form submission',
		text: textBody,
	});

	if (error) {
		console.error('Resend error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error.message || 'Failed to send email',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}

	return new Response(
		JSON.stringify({ success: true, id: data?.id }),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		},
	);
}

