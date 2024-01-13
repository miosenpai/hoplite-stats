type StatsResType = BrStats & { pending?: true }

export default defineCachedEventHandler(async (event) => {
  const runtimeCfg = useRuntimeConfig()

  const username = getRouterParam(event, 'username')!

  const mojangApi = useMojangApi()

  // todo: investigate moving this after firstReq checks to eliminate the 2nd redundant req
  const uuidRes = await mojangApi.usernameToUuid(username)

  if (uuidRes.status === 404 || uuidRes._data!.demo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Failed to find Minecraft player.',
    })
  }

  const cacheStore = useStorage('cache')

  // const firstReq = !(await cacheStore.hasItem(`nitro:functions:hoplite-stats:${uuidRes._data!.id}.json`))
  const firstReq = !(await cacheStore.hasItem(`nitro:handlers:hoplite-stats-route:${uuidRes._data!.id}.json`))

  if (firstReq && !isInternalReq()) {
    /* const scrapeQueue = useScrapeQueue()
    if (!scrapeQueue.getQueue().find(j => j.id === uuidRes._data!.id))
    // we use uuid as job key, this way we can't add duplicate scapes
      getHopliteStats(uuidRes._data!.id, uuidRes._data!.name) */

    $fetch(`/api/stats/${username}`, {
      headers: {
        'Internal-Req-Key': runtimeCfg.internalReqKey,
      },
    })
    // body must not be empty in order to nitro to cache
    return { pending: true } as StatsResType
  }

  /* const stats = await getHopliteStats(uuidRes._data!.id, uuidRes._data!.name)

  return stats */

  const scrapeQueue = useScrapeQueue()

  try {
    const scrapeRes = await scrapeQueue.push({ id: uuidRes._data!.id, username: uuidRes._data!.name })

    return scrapeRes as StatsResType
  } catch (err: any) {
    // todo: finer error handling
    throw createError({
      statusCode: err.message === ScrapeError.NO_HOPLITE_PROFILE ? 404 : 500,
    })
  }
}, {
  name: 'hoplite-stats-route',
  maxAge: dayjs.duration(12, 'hours').asSeconds(),
  getKey: (event) => {
    return getRouterParam(event, 'username')!
  },
  shouldInvalidateCache: () => {
    return isInternalReq()
  },
})

const getHopliteStats = defineCachedFunction(async (uuid: string, username: string) => {
  // const { statsQueue, statsQueueEvents } = useStatsQueue()

  const scrapeQueue = useScrapeQueue()

  console.log('Adding Job:', { uuid, username })

  /* const scrapeJob = await statsQueue.add(
    'scrape',
    { username },
    {
      removeOnFail: true,
      removeOnComplete: true,
      jobId: uuid,
    },
  ) */

  // console.log('Job Added')

  // const scrapeRes = await scrapeJob.waitUntilFinished(statsQueueEvents)

  const scrapeRes = await scrapeQueue.push({ username, id: uuid })

  console.log('Finished Scraping Stats')

  return scrapeRes
}, {
  // todo: figure out a good cache duration for stats
  maxAge: dayjs.duration(12, 'hours').asSeconds(),
  name: 'hoplite-stats',
  getKey(uuid) {
    return uuid
  },
})
