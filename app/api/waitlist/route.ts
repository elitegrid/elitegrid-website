import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const { error: dbError } = await supabaseAdmin
      .from('waitlist')
      .insert([{ email, source: 'website' }])

    if (dbError) {
      // Handle duplicate email
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'You are already on the waitlist!' },
          { status: 409 }
        )
      }
      throw dbError
    }

    // Send confirmation email
    await resend.emails.send({
      from: 'EliteGrid <hello@elitegrid.dev>',
      to: email,
      subject: 'You are on the EliteGrid waitlist!',
      html: `
        <div style="font-family: monospace; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #09090b; color: #f4f4f5;">
          <div style="margin-bottom: 32px;">
            <span style="background: #7c3aed; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 14px;">EliteGrid</span>
          </div>
          <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 16px; color: #f4f4f5;">You're on the list. 🎉</h1>
          <p style="color: #a1a1aa; line-height: 1.7; margin-bottom: 24px;">
            Thanks for joining the EliteGrid waitlist. We're building the TypeScript data grid that developers actually deserve — and you'll be among the first to know when it's ready.
          </p>
          <p style="color: #a1a1aa; line-height: 1.7; margin-bottom: 24px;">
            As a waitlist member you'll get:
          </p>
          <ul style="color: #a1a1aa; line-height: 2; margin-bottom: 32px; padding-left: 20px;">
            <li>Early sandbox access to try EliteGrid before public launch</li>
            <li>Behind-the-scenes dev updates as we build</li>
            <li>Direct line to the founders</li>
          </ul>
          <p style="color: #71717a; font-size: 13px;">
            — The EliteGrid Team<br/>
            <a href="https://elitegrid.dev" style="color: #7c3aed;">elitegrid.dev</a>
          </p>
        </div>
      `
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}