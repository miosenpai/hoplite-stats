import fastq from 'fastq'

type BattleRoyaleScrape = {
  category: 'battle-royale'
  username: string
}

type DuelsScrape = {
  category: 'duels'
  username: string
}

type BattleRoyaleLeaderboardScrape = {
  category: 'battle-royale-leaderboard'
  gamemode: string
  timespan: string
}

type DuelsLeaderboardScrape = {
  category: 'duels-leaderboard'
  kit: string
  teamSize: number
  timespan: string
}

const scrapeQueue = fastq.promise(async (job: BattleRoyaleScrape | DuelsScrape | BattleRoyaleLeaderboardScrape | DuelsLeaderboardScrape) => {
  console.log(`Starting '${job.category}' Scrape:`, job)
  const bot = await useBot()
  switch (job.category) {
    case 'battle-royale':
    case 'duels':
      return scrapeWindowStats(bot, job.username, job.category)
    case 'battle-royale-leaderboard':
      return scrapeBattleRoyaleLeaderboard(bot, job.gamemode, job.timespan)
    case 'duels-leaderboard':
      return scrapeDuelsLeaderboard(bot, job.kit, job.teamSize, job.timespan)
  }
}, 1)

// for type safety
async function addScrapeJob(job: BattleRoyaleScrape): Promise<BattleRoyaleStats>
async function addScrapeJob(job: DuelsScrape): Promise<DuelsStats>
async function addScrapeJob(job: BattleRoyaleLeaderboardScrape): Promise<BattleRoyaleLeaderboard>
async function addScrapeJob(job: DuelsLeaderboardScrape): Promise<DuelsLeaderboard>
async function addScrapeJob(job: BattleRoyaleScrape | DuelsScrape | BattleRoyaleLeaderboardScrape | DuelsLeaderboardScrape) {
  return scrapeQueue.push(job)
}

export const useScrapeQueue = () => {
  return {
    scrapeQueue,
    addScrapeJob,
  }
}
