import { Worker, Queue, QueueEvents } from 'bullmq'
import { once } from 'node:events'
import type { Window } from 'prismarine-windows'
import type { Item } from 'prismarine-item'
import IORedis from 'ioredis'

const QUEUE_NAME = 'stats'

type ScrapeJob = {
  username: string
}

type CustomName = {
  italic: boolean
  color: string
  text: string
}

type ItemWindowEvents = {
  updateSlot: (slot: number, oldItem: Item, newItem: Item) => Promise<void> | void
}

const statsQueue = new Queue<ScrapeJob, BrStats>(QUEUE_NAME, {
  connection: new IORedis(useRuntimeConfig().redisHost, {
    maxRetriesPerRequest: null,
  }),
})

const statsQueueEvents = new QueueEvents(QUEUE_NAME, {
  connection: new IORedis(useRuntimeConfig().redisHost, {
    maxRetriesPerRequest: null,
  }),
})

const statsWorker = new Worker<ScrapeJob, BrStats>(QUEUE_NAME, async (job) => {
  const bot = await useMineflayer()

  console.log('Bot: /stats', job.data.username)
  bot.chat(`/stats ${job.data.username}`)

  const [statsMenu] = await once(bot, 'windowOpen') as [Window]

  const brStatsBtn = statsMenu.containerItems().find((item) => {
    if (item.customName) {
      const customNameObj = JSON.parse(item.customName) as CustomName
      return customNameObj.text === 'Battle Royale Stats'
    }
    return false
  })

  if (!brStatsBtn)
    throw Error('BR stats button not found.')

  console.log('Bot: BR Stats Button Found')
  bot.simpleClick.leftMouse(brStatsBtn.slot)

  const [brStatsMenu] = await once(bot, 'windowOpen') as [Window<ItemWindowEvents>]
  console.log('Bot: BR Stats Menu Opened')

  await new Promise<void>((resolve, reject) => {
    let pendingUpdates = 6

    brStatsMenu.on('updateSlot', (_, __, newItem) => {
      pendingUpdates -= 1
      if (pendingUpdates === 0) {
        brStatsMenu.removeAllListeners('updateSlot')
        resolve()
      }
    })

    // todo: timeout protection (in case the # of items decreases/changes)
  })

  console.log('Bot: Finished Waiting For Stats Items')

  const brStatsMenuItems = brStatsMenu.containerItems().map((item) => {
    return {
      customName: JSON.parse(item.customName!), // JSON.parse can handle null
      customLore: (item.customLore as string[] | null)?.map(loreStr => JSON.parse(loreStr)),
    }
  })

  bot.closeWindow(brStatsMenu)

  const { scrapeBrStats } = useScrapeFunctions()

  console.log('Bot: Parsing Stats Items')
  const statsRes = await scrapeBrStats(brStatsMenuItems)

  return statsRes
}, {
  connection: new IORedis(useRuntimeConfig().redisHost, {
    maxRetriesPerRequest: null,
  }),
})

export function useStatsQueue() {
  return {
    statsQueue,
    statsQueueEvents,
  }
}
