export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')!

  const mojangApi = useMojangApi()

  const uuidRes = await mojangApi.usernameToUuid(username)

  if (!uuidRes._data || uuidRes._data.demo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Failed to find Minecraft player.',
    })
  }

  const cacheStore = useStorage('cache')

  const firstScrape = !(await cacheStore.hasItem(`nitro:functions:hoplite-stats:${uuidRes._data.id}.json`))

  if (firstScrape) {
    // we use uuid as job key, this way we can't add duplicate scapes
    getHopliteStats(uuidRes._data.id, uuidRes._data.name)
    setResponseStatus(event, 202)
    return
  }

  const stats = await getHopliteStats(uuidRes._data.id, uuidRes._data.name)

  return stats
})

const getHopliteStats = defineCachedFunction(async (uuid: string, username: string) => {
  const { statsQueue, statsQueueEvents } = useStatsQueue()

  const scrapeJob = await statsQueue.add(
    'scrape',
    { username },
    {
      removeOnFail: true,
      removeOnComplete: true,
      jobId: uuid,
    },
  )

  const scrapeRes = await scrapeJob.waitUntilFinished(statsQueueEvents)

  return scrapeRes
}, {
  // todo: figure out a good cache duration for stats
  maxAge: dayjs.duration(12, 'hours').asSeconds(),
  name: 'hoplite-stats',
  getKey(uuid) {
    return uuid
  },
})
