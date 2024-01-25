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

  const uuidRes = await useMojangApi().usernameToUuid(username)

  if (uuidRes.status === 404 || uuidRes._data!.demo) {
    throw createError({
      statusCode: 404,
      message: ScrapeError.INVALID_USERNAME,
    })
  }

  const cacheStore = useStorage('cache')

  const currKeys = await cacheStore.getKeys(`nitro:functions:stats:${uuidRes._data!.id}`)

  // console.log(currKeys)

  // first scrape
  if (currKeys.length !== 2) {
    // const { scrapeQueue } = useScrapeQueue()

    // don't need to worry about duplicate initial scrapes (cachedFunction doesn't rerun when one's pending)
    if (!currKeys.some(k => k.includes('battle-royale')))
      getBattleRoyaleStats(uuidRes._data!.id, uuidRes._data!.name)

    if (!currKeys.some(k => k.includes('duels')))
      getDuelsStats(uuidRes._data!.id, uuidRes._data!.name)

    // we use uuid as job key, to not add duplicate scapes
    /* const scrapeInProgress = scrapeQueue.getQueue().find(j => j.category === query.category && j.username === uuidRes._data!.name)
    if (!scrapeInProgress) {
      switch (query.category) {
        case 'battle-royale':
          getBattleRoyaleStats(uuidRes._data!.id, uuidRes._data!.name)
          break
        case 'duels':
          getDuelsStats(uuidRes._data!.id, uuidRes._data!.name)
          break
      }
    } */
    setResponseStatus(event, 202)

    const runtimeCfg = useRuntimeConfig()

    const sseToken = await new jose.SignJWT({ uuid: uuidRes._data!.id, username: uuidRes._data!.name })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(Buffer.from(runtimeCfg.sseSecret))

    return { sseToken }
  }

  let statsRes = null

  switch (query.category) {
    case 'battle-royale':
      statsRes = await getBattleRoyaleStats(uuidRes._data!.id, uuidRes._data!.name)
      break
    case 'duels':
      statsRes = await getDuelsStats(uuidRes._data!.id, uuidRes._data!.name)
      break
  }

  if ('err' in statsRes) {
    throw createError({
      statusCode: [ScrapeError.NO_HOPLITE_PROFILE].includes(statsRes.err) ? 404 : 500,
      message: Object.values(ScrapeError).includes(statsRes.err) ? statsRes.err : UNKNOWN_ERROR,
    })
  } else {
    return {
      username: uuidRes._data!.name,
      stats: statsRes,
    }
  }
})

export const getBattleRoyaleStats = defineCachedFunction(async (uuid: string, username: string) => {
  const { addScrapeJob } = useScrapeQueue()

  try {
    const scrapeRes = await addScrapeJob({ username, category: 'battle-royale' })

    return scrapeRes
  } catch (err: any) { // must catch here, if defineCachedFunction errors it will infinitely return a cached res
    console.log(err)
    return { err: err.message }
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
  const { addScrapeJob } = useScrapeQueue()

  try {
    const scrapeRes = await addScrapeJob({ username, category: 'duels' })

    return scrapeRes
  } catch (err: any) { // must catch here, if defineCachedFunction errors it will infinitely return a cached res
    console.log(err)
    return { err: err.message }
  }
}, {
  maxAge: dayjs.duration(1, 'hours').asSeconds(),
  name: 'stats',
  getKey(uuid) {
    return `${uuid}:duels`
  },
})
