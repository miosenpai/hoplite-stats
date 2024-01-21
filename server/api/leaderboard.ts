import { z } from 'zod'

const querySchema = z.object({
  gamemode: z.union([
    z.literal('solo'),
    z.literal('civ'),
  ]).default('solo'),
  timespan: z.union([
    z.literal('lifetime'),
    z.literal('season'),
    z.literal('monthly'),
    z.literal('weekly'),
    z.literal('daily'),
  ]).default('lifetime'),
})

const QUERY_COMBOS = ['solo', 'civ'].reduce((prev, curr: string) => {
  const combos = ['lifetime', 'season', 'monthly', 'weekly', 'daily'].map(timespan => ({ gamemode: curr, timespan }))
  prev.push(...combos)
  return prev
}, [] as { gamemode: string, timespan: string }[])

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, query => querySchema.parse(query))

  const cacheStore = useStorage('cache')

  const currKeys = await cacheStore.getKeys('nitro:functions:leaderboard')

  // first scrape
  if (currKeys.length !== QUERY_COMBOS.length) {
    const scrapeQueue = useScrapeQueue()

    const scrapeInProgress = scrapeQueue.getQueue().some(j => j.category === 'leaderboard')
    if (!scrapeInProgress)
      QUERY_COMBOS.forEach(q => getLeaderboard(q.gamemode, q.timespan))

    setResponseStatus(event, 202)
    return
  }

  const leaderboardRes = await getLeaderboard(query.gamemode, query.timespan)

  if ('err' in leaderboardRes) {
    throw createError({
      statusCode: [ScrapeError.NO_HOPLITE_PROFILE].includes(leaderboardRes.err) ? 404 : 500,
      message: Object.values(ScrapeError).includes(leaderboardRes.err) ? leaderboardRes.err : UNKNOWN_ERROR,
    })
  } else {
    return leaderboardRes
  }
})

export const getLeaderboard = defineCachedFunction(async (gamemode: string, timespan: string) => {
  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.push({ category: 'leaderboard', gamemode, timespan })

    return scrapeRes
  } catch (err: any) {
    console.log(err)
    return { err: err.message }
  }
}, {
  name: 'leaderboard',
  maxAge: dayjs.duration(2, 'hours').asSeconds(),
  getKey: (gamemode: string, timespan: string) => {
    return `${gamemode}:${timespan}`
  },
})

/*

leaderboard:solo:lifetime

*/
