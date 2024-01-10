import fastq from 'fastq'
// import type { queueAsPromised } from 'fastq'

const scrapeQueue = fastq.promise(undefined, handleScrapeJob, 1)

export function useScrapeQueue() {
  return scrapeQueue
}
