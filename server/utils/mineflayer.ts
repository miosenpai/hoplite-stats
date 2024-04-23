import mineflayer from 'mineflayer'
import { on, once } from 'node:events'
import { pathfinder, Movements } from 'mineflayer-pathfinder'
import timer from 'node:timers/promises'
import pTimeout from 'p-timeout'

let bot: mineflayer.Bot | null = null

let inactiveDc: NodeJS.Timeout | null = null

let afk = false

const createNewBot = async () => {
  const runtimeCfg = useRuntimeConfig()

  const newBot = mineflayer.createBot({
    username: runtimeCfg.bot.authName,
    auth: 'microsoft',
    host: runtimeCfg.bot.serverHost,
    port: runtimeCfg.bot.serverPort,
    version: '1.20.1',
    checkTimeoutInterval: 60 * 1000,
    // https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/src/client/microsoftAuth.js#L11
    // https://github.com/PrismarineJS/prismarine-auth/blob/master/src/common/Constants.js
    authTitle: 'c36a9fb6-4f2a-41ff-90bd-ae7cc92031eb',
    // @ts-ignore
    flow: 'msal',
  })

  const onResourcePack = () => {
    console.log('Resource Pack: Accepting')
    newBot.acceptResourcePack()
  }

  newBot.on('resourcePack', onResourcePack)

  const onAfkRespawn = async () => {
    if (afk)
      return

    await timer.setTimeout(5 * 1000)
    const receivedBarMsg = await pTimeout(once(newBot._client, 'action_bar'), {
      milliseconds: 2 * 1000,
      message: false,
    })
    if (!receivedBarMsg)
      return

    afk = true
    console.log('Entered AFK Lobby')

    // the limbo server's a subset of a full MC server, breaks mineflayer ticks so this doesn't work
    // newBot.look(newBot.entity.yaw + 10, newBot.entity.pitch, true)
    const originalYaw = newBot.entity.yaw
    let offset = 1

    const rotateTask = setInterval(() => {
      newBot._client.write('look', {
        yaw: originalYaw + offset,
        pitch: newBot.entity.pitch,
        onGround: true,
      })
      offset += 1
    }, 100)

    await once(newBot, 'respawn')

    clearInterval(rotateTask)

    afk = false
    console.log('Exited AFK Lobby')
  }

  afk = false
  newBot.on('respawn', onAfkRespawn)

  newBot.on('kicked', console.log)
  newBot.on('error', console.log)

  let connections = runtimeCfg.bot.serverHost === 'hoplite.gg' ? 0 : 1

  const initalConn = new AbortController()

  const onInitConnFail = () => initalConn.abort()

  newBot.once('end', onInitConnFail)

  const cleanUpListeners = () => {
    newBot.removeListener('resourcePack', onResourcePack)
    newBot.removeListener('respawn', onAfkRespawn)

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
  const movement = new Movements(newBot)
  movement.canDig = false
  newBot.pathfinder.setMovements(movement)

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
