import PQueue from 'p-queue'

const scrapeQueue = new PQueue({
  concurrency: 1,
  timeout: 7500,
})

export const useScrapeQueue = () => {
  return scrapeQueue
}
