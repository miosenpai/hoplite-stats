import fastq from 'fastq'
import timer from 'node:timers/promises'

export type ScrapeJob = {
  category: 'battle-royale' | 'duels'
  username: string
  uuid: string
} | {
  category: 'leaderboard'
  gamemode: string
  timespan: string
}

export const handleScrapeJob = async (job: ScrapeJob) => {
  const bot = await useBot()
  console.log(`Starting '${job.category}' Scrape:`, job)
  switch (job.category) {
    case 'battle-royale':
    case 'duels':
      return scrapeWindowStats(bot, job.username, job.category)
    case 'leaderboard': {
      const res = await scrapeLeaderboard(bot, job.gamemode, job.timespan)
      // this timeout is important to not trigger hologram action cooldown
      await timer.setTimeout(4000)
      return res
    }
  }
}

const scrapeQueue = fastq.promise(handleScrapeJob, 1)

export const useScrapeQueue = () => {
  return scrapeQueue
}
