import { createAPIFileRoute } from '@tanstack/start/api'
import { getAuth } from '@/lib/auth'
import { getEvent } from 'vinxi/http'

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: async ({ request }) => {
    const event = getEvent()
    const db = event?.context?.cloudflare?.env?.DB || process.env.DB
    return getAuth(db).handler(request)
  },
  POST: async ({ request }) => {
    const event = getEvent()
    const db = event?.context?.cloudflare?.env?.DB || process.env.DB
    return getAuth(db).handler(request)
  },
})
