import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, type, message } = await req.json()

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters.' },
        { status: 400 }
      )
    }

    const reportType = type || 'General Feedback'

    // Save to Supabase (best-effort — don't fail the request if table missing)
    try {
      await supabaseAdmin.from('feedback').insert([{
        name: name?.trim() || null,
        email: email?.trim() || null,
        type: reportType,
        message: message.trim(),
      }])
    } catch {
      // Table may not exist yet — continue so email still goes out
    }

    const senderName = name?.trim() || 'Anonymous'
    const senderEmail = email?.trim()

    // Notify the team
    await resend.emails.send({
      from: 'EliteGrid Feedback <hello@elitegrid.dev>',
      to: 'sahilpatel0977@gmail.com',
      subject: `[${reportType}] New feedback from ${senderName}`,
      html: `
        <div style="font-family:monospace;max-width:560px;margin:0 auto;padding:40px 24px;background:#09090b;color:#f4f4f5;">
          <div style="margin-bottom:24px;">
            <span style="background:#e8ff47;color:#09090b;padding:4px 12px;border-radius:4px;font-weight:700;font-size:14px;">EliteGrid</span>
          </div>
          <h2 style="font-size:20px;font-weight:700;margin-bottom:20px;color:#f4f4f5;">${reportType}</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0;color:#71717a;width:80px;vertical-align:top;">From</td>
              <td style="padding:8px 0;color:#f4f4f5;">${senderName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;vertical-align:top;">Email</td>
              <td style="padding:8px 0;color:#f4f4f5;">${senderEmail || '—'}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;vertical-align:top;">Message</td>
              <td style="padding:8px 0;color:#f4f4f5;white-space:pre-wrap;">${message.trim()}</td>
            </tr>
          </table>
          <p style="color:#3f3f46;font-size:12px;">Sent via elitegrid.dev feedback form</p>
        </div>
      `,
    })

    // Confirmation email to the reporter (only if they provided an address)
    if (senderEmail) {
      await resend.emails.send({
        from: 'EliteGrid <hello@elitegrid.dev>',
        to: senderEmail,
        subject: `We received your ${reportType.toLowerCase()} — EliteGrid`,
        html: `
          <div style="font-family:monospace;max-width:560px;margin:0 auto;padding:40px 24px;background:#09090b;color:#f4f4f5;">
            <div style="margin-bottom:32px;">
              <span style="background:#e8ff47;color:#09090b;padding:4px 12px;border-radius:4px;font-weight:700;font-size:14px;">EliteGrid</span>
            </div>
            <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#f4f4f5;">We got your message. 👋</h1>
            <p style="color:#a1a1aa;line-height:1.7;margin-bottom:24px;">
              Thanks${senderName !== 'Anonymous' ? `, ${senderName}` : ''} — your <strong style="color:#f4f4f5;">${reportType.toLowerCase()}</strong> has been received. We read every submission and will follow up here if we need more details.
            </p>
            <div style="background:#111113;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0 0 6px;color:#52525b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Your message</p>
              <p style="margin:0;color:#a1a1aa;line-height:1.7;white-space:pre-wrap;">${message.trim()}</p>
            </div>
            <p style="color:#71717a;font-size:13px;">
              — The EliteGrid Team<br/>
              <a href="https://elitegrid.dev" style="color:#e8ff47;">elitegrid.dev</a>
            </p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
