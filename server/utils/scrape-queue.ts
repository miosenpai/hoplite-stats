import PQueue from 'p-queue'

const scrapeQueue = new PQueue({ concurrency: 1 })

export const useScrapeQueue = () => {
  return scrapeQueue
}
