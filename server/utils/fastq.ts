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

  return statsRes
}

const queueCtx = {
  bot: null as null | mineflayer.Bot,
  inactiveDc: null as null | NodeJS.Timeout,
  authCache: null as null | ReturnType<typeof createAuthCache>,
  async initBot() {
    const runtimeCfg = useRuntimeConfig()

    const bot = mineflayer.createBot({
      username: runtimeCfg.bot.authName,
      host: runtimeCfg.bot.serverHost,
      auth: 'microsoft',
      // @ts-ignore
      profilesFolder: (authCacheOpts: Parameter<typeof createAuthCache>[0]) => {
        if (!this.authCache)
          this.authCache = createAuthCache(authCacheOpts)
        return this.authCache
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

      bot.on('end', (reason) => {
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
  },
  onBotEnd(reason: string) {
    console.log('Bot DC:', reason)
    clearTimeout(this.inactiveDc!)
    this.bot?.removeAllListeners()
    this.bot = null
  },
}

const scrapeQueue = fastq.promise(queueCtx, handleScrapeJob, 1)

export function useScrapeQueue() {
  return scrapeQueue
}
