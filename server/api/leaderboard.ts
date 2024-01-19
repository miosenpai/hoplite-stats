import { z } from 'zod'

const querySchema = z.object({
  category: z.union([
    z.literal('wins'),
    z.literal('kills'),
  ]).default('wins'),
  gamemode: z.union([
    z.literal('solo'),
    z.literal('civ'),
  ]).default('solo'),
  timespan: z.union([
    z.literal('lifetime'),
    z.literal('season'),
    z.literal('month'),
    z.literal('week'),
    z.literal('day'),
  ]).default('lifetime'),
})

const KEYS_COUNT = 2 * 5

export default defineEventHandler(async (event) => {
  
  const query = await getValidatedQuery(event, query => querySchema.parse(query))

  const cacheStore = useStorage('cache')

  const currKeys = await cacheStore.getKeys('leaderboard')

  // first scrape
  if (currKeys.length !== KEYS_COUNT) {



    setResponseStatus(event, 202)
    return
  }

  query.category
  query.gamemode
  query.timespan

})

export const getLeaderboard = defineCachedFunction((gamemode: string, timeframe: string) => {
  
  

}, {
  name: 'leaderboard',
  getKey: (gamemode: string, timeframe: string) => {
    return `${gamemode}:${timeframe}`
  },
})

/*

leaderboard:solo:lifetime

*/