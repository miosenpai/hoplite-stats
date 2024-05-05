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

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, query => querySchema.parse(query))

  const cacheStore = useStorage('cache')
  const scrapeJobStore = useStorage('lru')

  const cached = await cacheStore
    .hasItem(`nitro:functions:leaderboard:${query.gamemode}:${query.timespan}.json`)

  if (!cached) {
    const jobId = `leaderboard:${query.gamemode}:${query.timespan}`
    const jobExists = await scrapeJobStore.hasItem(jobId)

    if (!jobExists)
      await scrapeJobStore.setItemRaw(jobId, getBattleRoyaleLeaderboard(query.gamemode, query.timespan))

    return {
      jobId,
    }
  }

  const leaderboardRes = await getBattleRoyaleLeaderboard(query.gamemode, query.timespan)

  if ('err' in leaderboardRes) {
    throw createError({
      statusCode: errorToStatusCode(leaderboardRes.err),
      message: leaderboardRes.err,
    })
  } else {
    return leaderboardRes
  }
})

const getBattleRoyaleLeaderboard = defineCachedFunction(async (gamemode: string, timespan: string) => {
  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.add(async () => {
      console.log('Starting BR Leaderboard Scrape:', { gamemode, timespan })
      const bot = await useBot()
      return scrapeBattleRoyaleLeaderboard(bot, gamemode, timespan)
    }, { throwOnTimeout: true })

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
