import fastq from 'fastq'

export type ScrapeJob = {
  category: 'battle-royale' | 'duels'
  username: string
  uuid: string
} | {
  category: 'leaderboard'
}

export const handleScrapeJob = async (job: ScrapeJob) => {
  const bot = await useBot()
  console.log(`Adding '${job.category}' Scrape:`, job)
  switch (job.category) {
    case 'battle-royale':
    case 'duels':
      return scrapeWindowStats(bot, job.username, job.category)
    case 'leaderboard':
      throw Error('Not yet implemented.')
  }
}

const scrapeQueue = fastq.promise(handleScrapeJob, 1)

export const useScrapeQueue = () => {
  return scrapeQueue
}
