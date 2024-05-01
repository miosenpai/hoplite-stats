import { getBattleRoyaleStats } from '../[username]'

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
    if (!scrapeJobStore.hasItem(jobId))
      scrapeJobStore.setItem(jobId, getBattleRoyaleStats(uuidRes.id, uuidRes.name))

    return { jobId }
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
