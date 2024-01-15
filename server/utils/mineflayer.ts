import mineflayer from 'mineflayer'
import { on } from 'node:events'

let bot: mineflayer.Bot | null = null

const authCaches = new Map<string, ReturnType<typeof createAuthCache>>()

let inactiveDc: NodeJS.Timeout | null = null

const createNewBot = async () => {
  const runtimeCfg = useRuntimeConfig()

  const newBot = mineflayer.createBot({
    username: runtimeCfg.bot.authName,
    host: runtimeCfg.bot.serverHost,
    auth: 'microsoft',
    // @ts-ignore
    profilesFolder: (authCacheOpts: Parameters<typeof createAuthCache>[0]) => {
      if (!authCaches.has(authCacheOpts.cacheName))
        authCaches.set(authCacheOpts.cacheName, createAuthCache(authCacheOpts))
      return authCaches.get(authCacheOpts.cacheName)
    },
    version: '1.20.1',
  })

  const onResourcePack = () => {
    console.log('Resource Pack: Accepting')
    newBot.acceptResourcePack()
  }

  newBot.on('resourcePack', onResourcePack)

  newBot.on('kicked', console.log)
  newBot.on('error', console.log)

  let connections = runtimeCfg.bot.serverHost === 'hoplite.gg' ? 0 : 1

  const initalConn = new AbortController()

  newBot.once('end', initalConn.abort)

  const cleanUpListeners = () => {
    newBot.removeListener('resourcePack', onResourcePack)
    newBot.removeListener('kicked', console.log)
    newBot.removeListener('error', console.log)
  }

  try {
    for await (const _ of on(newBot, 'spawn', { signal: initalConn.signal })) {
      connections += 1

      if (connections === 1)
        console.log('Bot Connected: Queue')

      if (connections === 2) {
        console.log('Bot Connected: Lobby')
        newBot.removeListener('end', initalConn.abort)
        break
      }
    }
  } catch (err) {
    cleanUpListeners()
    throw err
  }

  inactiveDc = setTimeout(newBot.quit, dayjs.duration(runtimeCfg.bot.idleMinutes, 'minutes').asMilliseconds())

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