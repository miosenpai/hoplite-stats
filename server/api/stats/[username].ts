export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')!

  const mojangApi = useMojangApi()

  const uuidRes = await mojangApi.usernameToUuid(username)

  if (uuidRes.demo)
    throw createError({
      statusCode: 404,
      statusMessage: 'This user does not own Minecraft.',
    })

  const stats = await getHopliteStats(uuidRes.id, uuidRes.name)

  return stats
})

const getHopliteStats = defineCachedFunction(async (uuid: string, username: string) => {
  const { statsQueue, statsQueueEvents } = useStatsQueue()

  const scrapeJob = await statsQueue.add(
    'scrape',
    { username },
    {
      removeOnFail: true, // for dev
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
