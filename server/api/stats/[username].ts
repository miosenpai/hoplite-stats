import { z } from 'zod'

const querySchema = z.object({
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

  const firstScrape = !(await cacheStore.hasItem(`nitro:functions:hoplite-${query.category}-stats:${uuidRes._data!.id}.json`))

  if (firstScrape) {
    const scrapeQueue = useScrapeQueue()
    // we use uuid as job key, to not add duplicate scapes
    const scrapeInProgress = scrapeQueue.getQueue().find(j => j.category === query.category && j.uuid === uuidRes._data!.id)
    if (!scrapeInProgress) {
      switch (query.category) {
        case 'battle-royale':
          getBattleRoyaleStats(uuidRes._data!.id, uuidRes._data!.name)
          break
        case 'duels':
          getDuelsStats(uuidRes._data!.id, uuidRes._data!.name)
      }
    }
    setResponseStatus(event, 202)
    return
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
    return statsRes
  }
})

const getBattleRoyaleStats = defineCachedFunction(async (uuid: string, username: string) => {
  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.push({ username, uuid, category: 'battle-royale' })

    return scrapeRes
  } catch (err: any) { // must catch here, if defineCachedFunction errors it will infinitely return a cached res
    console.log(err)
    return { err: err.message }
  }
}, {
  // todo: figure out a good cache duration for stats
  maxAge: dayjs.duration(2, 'hours').asSeconds(),
  name: 'battle-royale-stats',
  getKey(uuid) {
    return uuid
  },
})

const getDuelsStats = defineCachedFunction(async (uuid: string, username: string) => {
  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.push({ username, uuid, category: 'duels' })

    return scrapeRes
  } catch (err: any) { // must catch here, if defineCachedFunction errors it will infinitely return a cached res
    console.log(err)
    return { err: err.message }
  }
}, {
  maxAge: dayjs.duration(1, 'hours').asSeconds(),
  name: 'duels-stats',
  getKey(uuid) {
    return uuid
  },
})
