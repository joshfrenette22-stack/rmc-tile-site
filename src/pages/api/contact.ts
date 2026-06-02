import type { APIRoute } from 'astro';

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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RMC Tile Website <onboarding@resend.dev>',
        to: import.meta.env.CONTACT_EMAIL || 'joshfrenette22@gmail.com',
        reply_to: email,
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
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
