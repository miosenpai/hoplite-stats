export default defineEventHandler(async (event) => {
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
  const scrapeJobStore = useStorage('lru')

  const cached = await cacheStore.hasItem(`nitro:functions:stats:${uuidRes.id}:battle-royale.json`)

  if (!cached) {
    // can probably just use uuid here (extend p-queue with a map uuid -> promise)
    const jobId = `stats:${uuidRes.id}:battle-royale`
    const jobExists = await scrapeJobStore.hasItem(jobId)

    if (!jobExists)
      await scrapeJobStore.setItemRaw(jobId, getBattleRoyaleStats(uuidRes.id, uuidRes.name))

    return {
      username: uuidRes.name,
      jobId,
    }
  }

  const battleRoyaleStats = await getBattleRoyaleStats(uuidRes.id, uuidRes.name)

  if ('err' in battleRoyaleStats) {
    throw createError({
      statusCode: errorToStatusCode(battleRoyaleStats.err),
      message: battleRoyaleStats.err,
    })
  }

  return {
    username: uuidRes.name,
    stats: battleRoyaleStats,
  }
})

const getBattleRoyaleStats = defineCachedFunction(async (uuid: string, username: string) => {
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
