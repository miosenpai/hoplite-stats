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
    QUERY_COMBOS
      .filter(q => !currKeys.includes(`nitro:functions:leaderboard:${q.gamemode}:${q.timespan}.json`))
      .forEach(q => getLeaderboard(q.gamemode, q.timespan))

    setResponseStatus(event, 202)
    return
  }

  const leaderboardRes = await getLeaderboard(query.gamemode, query.timespan)

  if ('err' in leaderboardRes) {
    throw createError({
      statusCode: errorToStatusCode(leaderboardRes.err),
      message: leaderboardRes.err,
    })
  } else {
    return leaderboardRes
  }
})

export const getLeaderboard = defineCachedFunction(async (gamemode: string, timespan: string) => {
  const { addScrapeJob } = useScrapeQueue()

  try {
    const scrapeRes = await addScrapeJob({ category: 'leaderboard', gamemode, timespan })

    return scrapeRes
  } catch (err: any) {
    if (Object.values(ScrapeError).includes(err.message)) {
      return { err: err.message }
    }
    throw err
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
