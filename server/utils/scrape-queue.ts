import fastq from 'fastq'

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
  console.log(`Adding '${job.category}' Scrape:`, job)
  switch (job.category) {
    case 'battle-royale':
    case 'duels':
      return scrapeWindowStats(bot, job.username, job.category)
    case 'leaderboard':
      return scrapeLeaderboard(bot, job.gamemode, job.timespan)
  }
}

const scrapeQueue = fastq.promise(handleScrapeJob, 1)

export const useScrapeQueue = () => {
  return scrapeQueue
}
