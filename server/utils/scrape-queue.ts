import { once, on } from 'node:events'
import type { Window } from 'prismarine-windows'
import type { Item } from 'prismarine-item'
import fastq from 'fastq'
import type { ChatMessage } from 'prismarine-chat'

export type ScrapeJob = {
  username: string
  id: string
}

type CustomName = {
  italic: boolean
  color: string
  text: string
}

type ItemWindowEvents = {
  updateSlot: (slot: number, oldItem: Item, newItem: Item) => Promise<void> | void
}

export const handleScrapeJob = async (job: ScrapeJob) => {
  const bot = await useBot()

  console.log('Bot: /stats', job.username)
  bot.chat(`/stats ${job.username}`)

  const statsErrMsg = new AbortController()

  const errMsgObserver = (jsonMsg: ChatMessage, position: string) => {
    if (position === 'system' && jsonMsg.extra?.at(1)?.toString().endsWith('An unexpected error occurred. Please try again later!')) {
      statsErrMsg.abort()
    }
  }

  bot.on('message', errMsgObserver)

  let statsMenu = null

  try {
    statsMenu = (await once(bot, 'windowOpen', { signal: statsErrMsg.signal }))[0] as Window
  } catch (err) {
    throw Error(ScrapeError.NO_HOPLITE_PROFILE)
  } finally {
    bot.removeListener('message', errMsgObserver)
  }

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

  let pendingUpdates = 6
  // todo: timeout protection (in case # of stats items decreases/changes)
  for await (const _ of on(brStatsMenu, 'updateSlot')) {
    pendingUpdates -= 1

    if (pendingUpdates === 0)
      break
  }

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
}

const scrapeQueue = fastq.promise(handleScrapeJob, 1)

export function useScrapeQueue() {
  return scrapeQueue
}
