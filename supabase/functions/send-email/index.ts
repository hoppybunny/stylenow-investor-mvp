// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import nodemailer from 'npm:nodemailer@6.9.10'

const transport = nodemailer.createTransport({
  host: Deno.env.get('SMTP_HOSTNAME')!,
  port: Number(Deno.env.get('SMTP_PORT')!),
  secure: Boolean(Deno.env.get('SMTP_SECURE')!),
  auth: {
    user: Deno.env.get('SMTP_USERNAME')!,
    pass: Deno.env.get('SMTP_PASSWORD')!
  }
})

console.log(`Function "send-email" up and running!`)

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }


  let payload: { formId?: string; timestamp?: string } = {}

  // Attempt to parse the incoming JSON payload.
  try {
    const jsonBody = await req.json()
    payload = jsonBody.body || {}
  } catch (error) {
    console.warn("No valid JSON payload found. Using default values.")
  }

  const { formId, timestamp } = payload

  // Create a subject and text that include details from the payload.
  const subject = "Investor Prototype Submission"
  let text = "A new form submission has been received.\n"

  if (formId || timestamp) {
    text += `Form ID: ${formId ?? "N/A"}\nSubmitted At: ${timestamp ?? "N/A"}`
  } else {
    text += "No additional details were provided."
  }

  try {
    await new Promise<void>((resolve, reject) => {
      transport.sendMail({
        from: Deno.env.get('SMTP_FROM')!,
        to: 'stylenow.clara@gmail.com',
        subject: subject,
        text: text,
      }, error => {
        if (error) {
          return reject(error)
        }

        resolve()
      })
    })
  } catch (error) {
    return new Response((error as Error).message, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } })
  }

  return new Response(
    JSON.stringify({
      done: true,
    }),
    {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email-smtp' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'