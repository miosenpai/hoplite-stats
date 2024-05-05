import { z } from 'zod'

const querySchema = z.object({
  jobId: z.string(),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)

  const scrapeJobStore = useStorage('lru')

  const jobPromise = await scrapeJobStore.getItemRaw<Promise<any>>(query.jobId)

  if (!jobPromise)
    throw createError({ statusCode: 404 })

  setHeader(event, 'cache-control', 'no-cache')
  setHeader(event, 'connection', 'keep-alive')
  setHeader(event, 'content-type', 'text/event-stream')
  setResponseStatus(event, 200)

  await scrapeJobStore.setItemRaw(query.jobId, undefined)

  try {
    const jobRes = await jobPromise
    event.node.res.write('event: complete\n')
    event.node.res.write(`data: ${JSON.stringify(jobRes)}\n\n`)
  } catch {
    event.node.res.write('event: fail\n')
    event.node.res.write('data: \n\n')
  }

  event._handled = true
})
