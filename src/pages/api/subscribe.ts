import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

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

	const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New subscription</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; color: #0f172a;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 24px;">
    <div style="background: linear-gradient(135deg, #0c4a6e 0%, #075985 100%); border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.05em; color: #ffffff;">WORLD SOLVED CASE</h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #bae6fd;">New subscription form submission</p>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr><td style="padding: 10px 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #0ea5e9; border-bottom: 2px solid #0ea5e9;">Personal information</td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Name</span><br/><span style="font-size: 15px;">${escapeHtml(firstName)} ${escapeHtml(lastName)}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Email</span><br/><span style="font-size: 15px;"><a href="mailto:${escapeHtml(email)}" style="color: #0ea5e9;">${escapeHtml(email)}</a></span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Phone</span><br/><span style="font-size: 15px;">${escapeHtml(phone) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Country</span><br/><span style="font-size: 15px;">${escapeHtml(country) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">City</span><br/><span style="font-size: 15px;">${escapeHtml(city) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Address</span><br/><span style="font-size: 15px;">${escapeHtml(address) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Identification number</span><br/><span style="font-size: 15px;">${escapeHtml(identificationNumber) || '—'}</span></td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 24px;">
        <tr><td style="padding: 10px 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #0ea5e9; border-bottom: 2px solid #0ea5e9;">Bank details</td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Bank name</span><br/><span style="font-size: 15px;">${escapeHtml(bankName) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Account number</span><br/><span style="font-size: 15px;">${escapeHtml(accountNumber) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">SWIFT code</span><br/><span style="font-size: 15px;">${escapeHtml(swiftCode) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Bank address</span><br/><span style="font-size: 15px;">${escapeHtml(bankAddress) || '—'}</span></td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 24px;">
        <tr><td style="padding: 10px 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #0ea5e9; border-bottom: 2px solid #0ea5e9;">Amounts</td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Invested amount</span><br/><span style="font-size: 15px; font-weight: 600;">${escapeHtml(investedAmount) || '—'}</span></td></tr>
        <tr><td style="padding: 8px 0;"><span style="color: #64748b; font-size: 12px;">Amount to recover</span><br/><span style="font-size: 15px; font-weight: 600;">${escapeHtml(amountToRecover) || '—'}</span></td></tr>
      </table>
      ${message ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 24px;">
        <tr><td style="padding: 10px 0 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #0ea5e9; border-bottom: 2px solid #0ea5e9;">Message</td></tr>
        <tr><td style="padding: 12px 0 0; font-size: 14px; line-height: 1.6; color: #334155;">${escapeHtml(message).replace(/\n/g, '<br/>')}</td></tr>
      </table>
      ` : ''}
    </div>
    <p style="margin: 16px 0 0; text-align: center; font-size: 11px; color: #94a3b8;">World Solved Case · This email was sent from your website form.</p>
  </div>
</body>
</html>
`.trim();

	const { data, error } = await resend.emails.send({
		from: 'World Solved Case <onboarding@resend.dev>',
		to: 'jorgeprojects1@gmail.com',
		subject: 'New subscription form submission',
		text: textBody,
		html: htmlBody,
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

