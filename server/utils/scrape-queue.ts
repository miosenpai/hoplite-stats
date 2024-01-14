import PQueue from 'p-queue'
import mineflayer from 'mineflayer'
import type { Window } from 'prismarine-windows'
import type { Item } from 'prismarine-item'
import type { ChatMessage } from 'prismarine-chat'
import { once } from 'node:events'
import fastq, { type queueAsPromised } from 'fastq'

type CustomName = {
  italic: boolean
  color: string
  text: string
}

type ItemWindowEvents = {
  updateSlot: (slot: number, oldItem: Item, newItem: Item) => Promise<void> | void
}

class ScrapeBot {
  bot: mineflayer.Bot | null
  // queue: PQueue
  authCache: Map<string, ReturnType<typeof createAuthCache>>
  inactiveDc: NodeJS.Timeout | null
  queue: queueAsPromised<ScrapeJob, BrStats>

  constructor() {
    // this.queue = new PQueue({ concurrency: 1 })
    this.authCache = new Map()

    this.bot = null
    this.inactiveDc = null

    this.queue = fastq.promise((job) => {
      return this.scrape(job)
    }, 1)
  }

  async scrape(job: ScrapeJob) {
    if (!this.bot) {
      this.bot = await this.createNewBot()
    } else {
      this.inactiveDc!.refresh()
    }

    // future: add different types of scrapes here
    return this.scrapeBrStats(this.bot, job)
  }

  /* async addJob(job: ScrapeJob) {
    return this.queue.add(() => this.scrape(job))
  } */
  async addJob(job: ScrapeJob) {
    return this.queue.push(job)
  }

  async scrapeBrStats(bot: mineflayer.Bot, job: ScrapeJob) {
    console.log('Bot: /stats', job.username)
    bot.chat(`/stats ${job.username}`)

    const statsMenu = await new Promise<Window>((resolve, reject) => {
      const onWindowOpen = (window: Window) => {
        bot.removeListener('message', onErrorMsg)
        resolve(window)
      }

      const onErrorMsg = (jsonMsg: ChatMessage, position: string) => {
        if (position === 'system' && jsonMsg.extra?.at(1)?.toString().endsWith('An unexpected error occurred. Please try again later!')) {
          bot.removeListener('windowOpen', onWindowOpen)
          bot.removeListener('message', onErrorMsg)
          reject(Error(ScrapeError.NO_HOPLITE_PROFILE))
        }
      }

      bot.once('windowOpen', onWindowOpen)
      bot.on('message', onErrorMsg)
    })

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
  }

  async createNewBot() {
    const runtimeCfg = useRuntimeConfig()

    const bot = mineflayer.createBot({
      username: runtimeCfg.bot.authName,
      host: runtimeCfg.bot.serverHost,
      auth: 'microsoft',
      // @ts-ignore
      profilesFolder: (authCacheOpts: Parameters<typeof createAuthCache>[0]) => {
        if (!this.authCache.has(authCacheOpts.cacheName))
          this.authCache.set(authCacheOpts.cacheName, createAuthCache(authCacheOpts))
        return this.authCache.get(authCacheOpts.cacheName)
      },
      version: '1.20.1',
    })

    bot.on('resourcePack', () => {
      console.log('Resource Pack: Accepting')
      bot.acceptResourcePack()
    })

    bot.on('kicked', console.log)
    bot.on('error', console.log)

    await new Promise<void>((resolve, reject) => {
      let conn = 0

      if (runtimeCfg.bot.serverHost !== 'hoplite.gg')
        conn += 1

      bot.on('spawn', () => {
        conn += 1

        if (conn === 1)
          console.log('Bot Connected: Queue')

        if (conn === 2) {
          console.log('Bot Connected: Lobby')
          bot.removeAllListeners('spawn')
          bot.removeAllListeners('end')
          resolve()
        }
      })

      bot.once('end', (reason) => {
        console.log('Bot Failed To Connect:', reason)
        bot.removeAllListeners()
        reject()
      })
    })

    this.inactiveDc = setTimeout(
      () => bot.quit(),
      dayjs.duration(runtimeCfg.bot.idleMinutes, 'minutes').asMilliseconds(),
    )

    bot.once('end', reason => this.onBotEnd(reason))

    return bot
  }

  onBotEnd(reason: string) {
    console.log('Bot DC:', reason)
    clearTimeout(this.inactiveDc!)
    this.bot!.removeAllListeners()
    this.bot = null
  }
}

const scrapeBot = new ScrapeBot()

export function useScrapeBot() {
  return scrapeBot
}
