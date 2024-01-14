export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')!

  const mojangApi = useMojangApi()

  const uuidRes = await mojangApi.usernameToUuid(username)

  if (uuidRes.status === 404 || uuidRes._data!.demo) {
    throw createError({
      statusCode: 404,
      message: ScrapeError.INVALID_USERNAME,
    })
  }

  const cacheStore = useStorage('cache')

  const firstScrape = !(await cacheStore.hasItem(`nitro:functions:hoplite-stats:${uuidRes._data!.id}.json`))

  if (firstScrape) {
    const scrapeQueue = useScrapeQueue()
    if (!scrapeQueue.getQueue().find(j => j.id === uuidRes._data!.id))
    // we use uuid as job key, this way we can't add duplicate scapes
      getHopliteStats(uuidRes._data!.id, uuidRes._data!.name)
    setResponseStatus(event, 202)
    return
  }

  const stats = await getHopliteStats(uuidRes._data!.id, uuidRes._data!.name)
  if ('err' in stats) {
    throw createError({
      statusCode: [ScrapeError.NO_HOPLITE_PROFILE].includes(stats.err) ? 404 : 500,
      message: Object.values(ScrapeError).includes(stats.err) ? stats.err : UNKNOWN_ERROR,
    })
  } else {
    return stats
  }
})

const getHopliteStats = defineCachedFunction(async (uuid: string, username: string) => {
  const scrapeQueue = useScrapeQueue()

  console.log('Adding Job:', { uuid, username })

  try {
    const scrapeRes = await scrapeQueue.push({ username, id: uuid })
    console.log('Finished Scraping Stats')

    return scrapeRes
  } catch (err: any) { // must catch here, if defineCachedFunction errors it will infinitely return a cached res
    console.log(err)
    return { err: err.message }
  }
}, {
  // todo: figure out a good cache duration for stats
  maxAge: dayjs.duration(12, 'hours').asSeconds(),
  name: 'hoplite-stats',
  getKey(uuid) {
    return uuid
  },
})
