import { z } from 'zod'

const querySchema = z.object({
  kit: z.enum([
    'overall',
    'sword',
    'battle-royale',
    'axe',
    'crystal',
    'archer',
    'potion',
    'nether-pot',
    'boxing',
    'bridge',
    'parkour',
    'custom',
  ]).default('overall'),
  teamSize: z.union([
    z.literal(1),
    z.literal(2),
  ]).default(1),
  timespan: z.enum([
    'lifetime',
    'season',
    'monthly',
    'weekly',
    'daily',
  ]).default('lifetime'),
}).refine((val) => {
  return !(val.kit === 'parkour' && val.teamSize === 2)
}, { message: '2v2 parkour does not exist' })

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, query => querySchema.parse(query))

  const cacheStore = useStorage('cache')

  const cached = await cacheStore
    .hasItem(`nitro:functions:leaderboard:${query.kit}:${query.teamSize}v${query.teamSize}:${query.timespan}.json`)

  if (!cached) {
    getDuelsLeaderboard(query.kit, query.teamSize, query.timespan)
    setResponseStatus(event, 202)
    return
  }

  const leaderboardRes = await getDuelsLeaderboard(query.kit, query.teamSize, query.timespan)

  if ('err' in leaderboardRes) {
    throw createError({
      statusCode: errorToStatusCode(leaderboardRes.err),
      message: leaderboardRes.err,
    })
  } else {
    return leaderboardRes
  }
})

const getDuelsLeaderboard = defineCachedFunction(async (kit: string, teamSize: number, timespan: string) => {
  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.add(async () => {
      console.log('Starting Duels Leaderboard Scrape:', { kit, teamSize, timespan })
      const bot = await useBot()
      return scrapeDuelsLeaderboard(bot, kit, teamSize, timespan)
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
  getKey: (kit: string, teamSize: number, timespan: string) => {
    return `${kit}:${teamSize}v${teamSize}:${timespan}`
  },
})
