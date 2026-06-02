import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, phone, email, type, timeline, address, details } = body;

    // Server-side validation
    if (!name?.trim() || !phone?.trim() || !email?.trim() || !details?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.GMAIL_USER,
        pass: import.meta.env.GMAIL_APP_PASSWORD,
      },
    });

    const contactEmail = import.meta.env.CONTACT_EMAIL || import.meta.env.GMAIL_USER;

    await transporter.sendMail({
      from: `"RMC Tile Website" <${import.meta.env.GMAIL_USER}>`,
      to: contactEmail,
      replyTo: email,
      subject: `New Estimate Request from ${name}`,
      html: `
        <h2>New Estimate Request</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          ${type ? `<tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Project Type</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(type)}</td></tr>` : ''}
          ${timeline ? `<tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Timeline</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(timeline)}</td></tr>` : ''}
          ${address ? `<tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Address</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(address)}</td></tr>` : ''}
          <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Details</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(details).replace(/\n/g, '<br>')}</td></tr>
        </table>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
