import mineflayer from 'mineflayer'

let bot: mineflayer.Bot

let botActive = false

async function createNewBot() {
  const runtimeCfg = useRuntimeConfig()

  const newBot = mineflayer.createBot({
    host: runtimeCfg.bot.serverHost,
    username: runtimeCfg.bot.authName,
    // bot.on('error', console.log)
    // hideErrors: false,
    auth: 'microsoft',
  })

  newBot.on('resourcePack', () => {
    console.log('Resource Pack: Accepting')
    newBot.acceptResourcePack()
  })

  newBot.on('kicked', console.log)
  newBot.on('error', console.log)

  /* newBot.on('actionBar', (msgJson) => {
    console.log('actionBar event')
    console.log(msgJson)
  }) */

  await new Promise<void>((resolve, reject) => {
    let connections = 0
    if (runtimeCfg.bot.serverHost !== 'hoplite.gg')
      connections += 1

    newBot.on('spawn', () => {
      connections += 1

      if (connections == 1)
        console.log('Bot Connected: Queue')

      // make sure we are in actual server, not queue lobby
      if (connections == 2) {
        console.log('Bot Connected: Lobby')
        botActive = true
        newBot.removeAllListeners('spawn')
        newBot.removeAllListeners('end')
        resolve()
      }
    })

    newBot.on('end', (reason) => {
      console.log('Bot Failed To Connect:', reason)
      newBot.removeAllListeners()
      reject()
    })
  })

  const inactiveDc = setTimeout(() => {
    console.log('Bot Inactive: Quitting')
    newBot.quit()
  }, 10 * 60 * 1000)
  // todo: use runtimeCfg inactive time limit

  newBot.on('end', (reason) => {
    if (reason !== 'disconnect.quitting')
      clearTimeout(inactiveDc)
    console.log('Bot Disconnected:', reason)
    newBot.removeAllListeners()
    botActive = false
  })

  return newBot
}

export async function useMineflayer() {
  if (!botActive)
    bot = await createNewBot()

  return bot
}
