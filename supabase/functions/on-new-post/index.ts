// Edge Function: on-new-post
// A minimal serverless hook you could wire to a Database Webhook so a new
// feature request fans out to Slack / email / a webhook. Kept dependency-free
// so it deploys as-is with `supabase functions deploy on-new-post`.

interface PostPayload {
  record?: { title?: string; description?: string }
}

Deno.serve(async (req: Request) => {
  const payload = (await req.json().catch(() => ({}))) as PostPayload
  const title = payload.record?.title ?? 'Untitled'

  // In a real deployment, post to SLACK_WEBHOOK_URL from function secrets:
  const webhook = Deno.env.get('SLACK_WEBHOOK_URL')
  if (webhook) {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `🆕 New feature request: *${title}*` }),
    })
  }

  return new Response(JSON.stringify({ ok: true, notified: Boolean(webhook) }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
