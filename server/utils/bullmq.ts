import mineflayer from 'mineflayer'
import { Worker, Queue, QueueEvents } from 'bullmq'

const QUEUE_NAME = 'stats'

class StatsWorker {
  worker: Worker
  bot!: mineflayer.Bot
  queue: Queue
  qEvents: QueueEvents

  botActive: boolean
  runtimeCfg: ReturnType<typeof useRuntimeConfig>

  constructor() {
    this.runtimeCfg = useRuntimeConfig()

    this.queue = new Queue(QUEUE_NAME)
    this.qEvents = new QueueEvents(QUEUE_NAME)

    this.botActive = false

    this.worker = new Worker(QUEUE_NAME, async (job) => {
      if (!this.botActive) {
        this.bot = await this.createNewBot()
      }

      this.bot.chat(job.name)
    }, {
      removeOnComplete: { count: 0 },
      connection: {},
      // autorun: false,
    })
  }

  async createNewBot() {
    const newBot = mineflayer.createBot({
      host: this.runtimeCfg.bot.serverHost,
      username: this.runtimeCfg.bot.authName,
      // bot.on('error', console.log)
      hideErrors: false,
      auth: 'microsoft',
    })

    newBot.on('resourcePack', () => {
      console.log('Resource Pack: Accepting')
      newBot.acceptResourcePack()
    })

    await new Promise<void>((resolve, reject) => {
      newBot.on('spawn', () => {
        // todo: make sure we are in actual server, not queue lobby
        console.log('Bot Connected')
        this.botActive = true
        newBot.removeAllListeners()
        resolve()
      })

      newBot.on('end', () => {
        newBot.removeAllListeners()
        reject('Failed to connect to server.')
      })
    })

    const inactiveDc = setTimeout(() => {
      console.log('Bot Inactive: Quitting')
      newBot.quit()
    }, 10 * 60 * 1000)

    newBot.on('end', (reason) => {
      if (reason !== 'disconnect.quitting')
        clearTimeout(inactiveDc)
      console.log('Bot Disconnected:', reason)
      newBot.removeAllListeners()
      this.botActive = false
    })

    return newBot
  }
}

let worker: StatsWorker | null = null

export function useStatsWorker() {
  if (!worker)
    worker = new StatsWorker()

  return worker
}
