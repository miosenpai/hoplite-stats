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

  const cached = await cacheStore.hasItem(`nitro:functions:stats:${uuidRes.id}:duels.json`)

  if (!cached) {
    // can probably just use uuid here (extend p-queue with a map uuid -> promise)
    // console.log('not cached')
    const jobId = `stats:${uuidRes.id}:duels`
    const jobExists = await scrapeJobStore.hasItem(jobId)

    if (!jobExists)
      await scrapeJobStore.setItemRaw(jobId, getDuelsStats(uuidRes.id, uuidRes.name))

    return {
      username: uuidRes.name,
      jobId,
    }
  }

  const duelsStats = await getDuelsStats(uuidRes.id, uuidRes.name)

  if ('err' in duelsStats) {
    throw createError({
      statusCode: errorToStatusCode(duelsStats.err),
      message: duelsStats.err,
    })
  }

  return {
    username: uuidRes.name,
    stats: duelsStats,
  }
})

const getDuelsStats = defineCachedFunction(async (uuid: string, username: string) => {
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
