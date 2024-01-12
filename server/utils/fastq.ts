import { once } from 'node:events'
import type { Window } from 'prismarine-windows'
import type { Item } from 'prismarine-item'
import mineflayer from 'mineflayer'
import fastq from 'fastq'

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

export async function handleScrapeJob(this: typeof queueCtx, job: ScrapeJob) {
  // const bot = await useMineflayer()
  if (!this.bot)
    this.bot = await this.initBot()

  console.log('Bot: /stats', job.username)
  this.bot.chat(`/stats ${job.username}`)

  const [statsMenu] = await once(this.bot, 'windowOpen') as [Window]

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
  this.bot.simpleClick.leftMouse(brStatsBtn.slot)

  const [brStatsMenu] = await once(this.bot, 'windowOpen') as [Window<ItemWindowEvents>]
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

  this.bot.closeWindow(brStatsMenu)

  const { scrapeBrStats } = useScrapeFunctions()

  console.log('Bot: Parsing Stats Items')
  const statsRes = await scrapeBrStats(brStatsMenuItems)

  /* bot.quit()

  await new Promise<void>((resolve) => {
    bot.once('end', (reason) => {
      resolve()
      console.log('DC:', reason)
    })
  })

  bot.removeAllListeners() */

  return statsRes
}

const queueCtx = {
  bot: null as null | mineflayer.Bot,
  async initBot() {
    const runtimeCfg = useRuntimeConfig()

    const bot = mineflayer.createBot({
      username: runtimeCfg.bot.authName,
      host: runtimeCfg.bot.serverHost,
      auth: 'microsoft',
      profilesFolder: runtimeCfg.bot.profilesDir || undefined,
      version: '1.20.1',
    })

    bot.on('resourcePack', () => {
      console.log('Resource Pack: Accepting')
      bot.acceptResourcePack()
    })

    bot.on('kicked', console.log)
    bot.on('error', console.log)

    await new Promise<void>((resolve) => {
      let conn = 0

      bot.on('spawn', () => {
        conn += 1

        if (conn === 1)
          console.log('Joined Queue')

        if (conn === 2) {
          console.log('Joined Lobby')
          resolve()
          bot.removeAllListeners('spawn')
        }
      })
    })

    bot.once('end', this.onBotEnd)

    return bot
  },
  onBotEnd(reason: string) {
    console.log('Bot DC:', reason)
    this.bot?.removeAllListeners()
    this.bot = null
  },
}

const scrapeQueue = fastq.promise(queueCtx, handleScrapeJob, 1)

export function useScrapeQueue() {
  return scrapeQueue
}
