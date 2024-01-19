import data from '~/assets/leaderboard-data.json'

export default defineEventHandler(async () => {
  /* const leaderboardRes = await parseLeaderboard(data)
  console.log(leaderboardRes) */
  const bot = await useBot()
  scrapeLeaderboard(bot, 'solo', 'lifetime')

  return {}
})
