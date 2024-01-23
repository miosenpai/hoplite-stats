import fastq from 'fastq'
import timer from 'node:timers/promises'

type BattleRoyaleScrape = {
  category: 'battle-royale'
  username: string
}

type DuelsScrape = {
  category: 'duels'
  username: string
}

type LeaderboardScrape = {
  category: 'leaderboard'
  gamemode: string
  timespan: string
}

const scrapeQueue = fastq.promise(async (job: BattleRoyaleScrape | DuelsScrape | LeaderboardScrape) => {
  const bot = await useBot()
  console.log(`Starting '${job.category}' Scrape:`, job)
  switch (job.category) {
    case 'battle-royale':
    case 'duels':
      return scrapeWindowStats(bot, job.username, job.category)
    case 'leaderboard': {
      const res = await scrapeLeaderboard(bot, job.gamemode, job.timespan)
      // todo: move this logic to the leaderboard scraper itself
      // this timeout is important to not trigger hologram action cooldown
      await timer.setTimeout(4000)
      return res
    }
  }
}, 1)

// for type safety
async function addScrapeJob(job: BattleRoyaleScrape): Promise<BattleRoyaleStats>
async function addScrapeJob(job: DuelsScrape): Promise<DuelsStats>
async function addScrapeJob(job: LeaderboardScrape): Promise<LeaderboardStats>
async function addScrapeJob(job: BattleRoyaleScrape | DuelsScrape | LeaderboardScrape) {
  return scrapeQueue.push(job)
}

export const useScrapeQueue = () => {
  return {
    scrapeQueue,
    addScrapeJob,
  }
}
