import mineflayer from 'mineflayer'
import { on } from 'node:events'
import { pathfinder } from 'mineflayer-pathfinder'
import type { ChatMessage } from 'prismarine-chat'

let bot: mineflayer.Bot | null = null

const authCaches = new Map<string, ReturnType<typeof createAuthCache>>()

let inactiveDc: NodeJS.Timeout | null = null

const createNewBot = async () => {
  const runtimeCfg = useRuntimeConfig()

  const newBot = mineflayer.createBot({
    username: runtimeCfg.bot.authName,
    auth: 'microsoft',
    host: runtimeCfg.bot.serverHost,
    port: runtimeCfg.bot.serverPort,
    // @ts-ignore
    /* profilesFolder: (authCacheOpts: Parameters<typeof createAuthCache>[0]) => {
      if (!authCaches.has(authCacheOpts.cacheName))
        authCaches.set(authCacheOpts.cacheName, createAuthCache(authCacheOpts))
      return authCaches.get(authCacheOpts.cacheName)
    }, */
    version: '1.20.1',
    checkTimeoutInterval: 60 * 1000,
  })

  const onResourcePack = () => {
    console.log('Resource Pack: Accepting')
    newBot.acceptResourcePack()
  }

  newBot.on('resourcePack', onResourcePack)

  const onAfkMsg = (jsonMsg: ChatMessage) => {
    // future: investigate which field the text is actually in
    if (JSON.stringify(jsonMsg.json).includes('You are AFK')) {
      newBot.setControlState('jump', true)
      newBot.setControlState('jump', false)
    }
  }

  newBot.on('actionBar', onAfkMsg)

  newBot.on('kicked', console.log)
  newBot.on('error', console.log)

  let connections = runtimeCfg.bot.serverHost === 'hoplite.gg' ? 0 : 1

  const initalConn = new AbortController()

  const onInitConnFail = () => initalConn.abort()

  newBot.once('end', onInitConnFail)

  const cleanUpListeners = () => {
    newBot.removeListener('resourcePack', onResourcePack)
    newBot.removeListener('actionBar', onAfkMsg)

    newBot.removeListener('kicked', console.log)
    newBot.removeListener('error', console.log)
  }

  const initConnTimeout = setTimeout(() => {
    console.log('Bot: Initial Connection Timeout')
    newBot.quit()
  }, 45 * 1000)

  let initConnTimeoutActive = true

  try {
    for await (const _ of on(newBot, 'spawn', { signal: initalConn.signal })) {
      connections += 1

      if (initConnTimeoutActive) {
        clearTimeout(initConnTimeout)
        initConnTimeoutActive = false
      }

      if (connections === 1)
        console.log('Bot Connected: Queue')

      if (connections === 2) {
        console.log('Bot Connected: Lobby')
        newBot.removeListener('end', onInitConnFail)
        break
      }
    }
  } catch (err) {
    cleanUpListeners()
    throw err
  }

  newBot.loadPlugin(pathfinder)

  if (import.meta.dev) {
    (await import('prismarine-viewer')).mineflayer(newBot, { port: 3030 })
  }

  inactiveDc = setTimeout(
    () => newBot.quit(),
    dayjs.duration(runtimeCfg.bot.idleMinutes, 'minutes').asMilliseconds(),
  )

  newBot.once('end', (reason) => {
    console.log('Bot DC:', reason)
    if (reason !== 'disconnect.quitting')
      clearTimeout(inactiveDc!)
    inactiveDc = null
    cleanUpListeners()
    bot = null
  })

  return newBot
}

export const useBot = async () => {
  if (!bot) {
    bot = await createNewBot()
  } else {
    inactiveDc!.refresh()
  }

  return bot
}
