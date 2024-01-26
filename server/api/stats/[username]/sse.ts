import { getBattleRoyaleStats, getDuelsStats } from '@/server/api/stats/[username]'
import { z } from 'zod'
import * as jose from 'jose'

const querySchema = z.object({
  sseToken: z.string(),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, query => querySchema.parse(query))

  const runtimeCfg = useRuntimeConfig()

  const { payload } = await jose.jwtVerify<ScraperSseJwt>(query.sseToken, Buffer.from(runtimeCfg.sseSecret))

  setHeader(event, 'cache-control', 'no-cache')
  setHeader(event, 'connection', 'keep-alive')
  setHeader(event, 'content-type', 'text/event-stream')
  setResponseStatus(event, 200)

  try {
    await Promise.all([
      getBattleRoyaleStats(payload.uuid, payload.username),
      getDuelsStats(payload.uuid, payload.username),
    ])

    event.node.res.write('event: complete\n')
    event.node.res.write('data:\n\n') // this field is required for the SSE spec

    // const data = query.category === 'battle-royale' ? battleRoyaleStats : duelsStats
    // event.node.res.write(`data: ${data}\n\n`)
  } catch {
    // todo: implement once get*Stats can distinguish (and propel) unexpected errors
  }

  event._handled = true
})
