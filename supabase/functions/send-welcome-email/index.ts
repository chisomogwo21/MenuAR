import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, restaurantName, slug, tier } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MenuAR <onboarding@menuar.com>',
        to: [email],
        subject: `Welcome to MenuAR, ${name}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #191C19;">
            <h1 style="color: #1A5C3A;">Welcome to MenuAR!</h1>
            <p>Hi ${name},</p>
            <p>Congratulations on launching <strong>${restaurantName}</strong> on MenuAR! We're thrilled to help you modernize your dining experience.</p>
            
            <div style="background: #FAFAF8; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p style="margin-top: 0;"><strong>Your Menu URL:</strong></p>
              <a href="https://menuar.com/${slug}/menu" style="color: #1A5C3A; font-weight: bold; text-decoration: none;">https://menuar.com/${slug}/menu</a>
            </div>

            <p><strong>Your Plan:</strong> ${tier.toUpperCase()}</p>
            
            <p>Next steps:</p>
            <ul>
              <li>Download your Table QR codes from the dashboard.</li>
              <li>Print and place them on your tables.</li>
              <li>Start receiving orders!</li>
            </ul>

            <p>If you have any questions, just reply to this email.</p>
            
            <p>Cheers,<br>The MenuAR Team</p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
