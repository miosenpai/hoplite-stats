import { z } from 'zod'

const querySchema = z.object({
  jobId: z.string(),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)

  const scrapeJobStore = useStorage('lru')

  if (!scrapeJobStore.hasItem(query.jobId))
    throw createError({ statusCode: 404 })

  setHeader(event, 'cache-control', 'no-cache')
  setHeader(event, 'connection', 'keep-alive')
  setHeader(event, 'content-type', 'text/event-stream')
  setResponseStatus(event, 200)

  try {
    const jobRes = await (await scrapeJobStore.getItem<Promise<any>>(query.jobId))
    scrapeJobStore.removeItem(query.jobId)

    event.node.res.write('event: complete\n')
    event.node.res.write(`event: data:${jobRes}`)
  } catch {
    event.node.res.write('event: fail\n')
    event.node.res.write('data:\n\n')
  }

  event._handled = true
})
