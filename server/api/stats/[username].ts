import { z } from 'zod'
import * as jose from 'jose'

export const querySchema = z.object({
  category: z.union([
    z.literal('battle-royale'),
    z.literal('duels'),
  ]).default('battle-royale'),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, query => querySchema.parse(query))

  const username = getRouterParam(event, 'username')!

  let uuidRes = null

  try {
    uuidRes = await usePlayerDb().usernameToUuid(username)
  } catch (err: any) {
    throw createError({
      statusCode: 404,
      message: ScrapeError.PROFILE_NOT_FOUND,
    })
  }

  const cacheStore = useStorage('cache')

  const currKeys = await cacheStore.getKeys(`nitro:functions:stats:${uuidRes.id}`)

  // console.log(currKeys)

  // first scrape
  if (currKeys.length !== 2) {
    // const { scrapeQueue } = useScrapeQueue()

    // don't need to worry about duplicate initial scrapes (cachedFunction doesn't rerun when one's pending)
    /* if (!currKeys.some(k => k.includes('battle-royale')))
      getBattleRoyaleStats(uuidRes._data!.id, uuidRes._data!.name)

    if (!currKeys.some(k => k.includes('duels')))
      getDuelsStats(uuidRes._data!.id, uuidRes._data!.name) */

    setResponseStatus(event, 202)

    const runtimeCfg = useRuntimeConfig()

    const sseToken = await new jose.SignJWT({ uuid: uuidRes.id, username: uuidRes.name })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(Buffer.from(runtimeCfg.sseSecret))

    return { sseToken }
  }

  let statsRes = null

  switch (query.category) {
    case 'battle-royale':
      statsRes = await getBattleRoyaleStats(uuidRes.id, uuidRes.name)
      break
    case 'duels':
      statsRes = await getDuelsStats(uuidRes.id, uuidRes.name)
      break
  }

  if ('err' in statsRes) {
    throw createError({
      statusCode: errorToStatusCode(statsRes.err),
      message: statsRes.err,
    })
  } else {
    return {
      username: uuidRes.name,
      stats: statsRes,
    }
  }
})

export const getBattleRoyaleStats = defineCachedFunction(async (uuid: string, username: string) => {
  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.add(async () => {
      console.log('Starting BR Stats Scrape:', username)
      const bot = await useBot()
      return scrapeWindowStats(bot, username, 'battle-royale')
    }, { throwOnTimeout: true })

    return scrapeRes
  } catch (err: any) { // must catch here, if defineCachedFunction errors it will infinitely return a cached res
    if (Object.values(ScrapeError).includes(err.message)) {
      return { err: err.message }
    }
    throw err
  }
}, {
  // todo: figure out a good cache duration for stats
  maxAge: dayjs.duration(2, 'hours').asSeconds(),
  name: 'stats',
  getKey(uuid) {
    return `${uuid}:battle-royale`
  },
})

export const getDuelsStats = defineCachedFunction(async (uuid: string, username: string) => {
  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.add(async () => {
      console.log('Starting Duels Stats Scrape:', username)
      const bot = await useBot()
      return scrapeWindowStats(bot, username, 'duels')
    }, { throwOnTimeout: true })

    return scrapeRes
  } catch (err: any) { // must catch here, if defineCachedFunction errors it will infinitely return a cached res
    if (Object.values(ScrapeError).includes(err.message)) {
      return { err: err.message }
    }
    throw err
  }
}, {
  maxAge: dayjs.duration(1, 'hours').asSeconds(),
  name: 'stats',
  getKey(uuid) {
    return `${uuid}:duels`
  },
})
