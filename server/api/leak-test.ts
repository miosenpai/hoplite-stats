import mineflayer from 'mineflayer'
import { once } from 'node:events'

export default defineEventHandler(async () => {
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

  bot.chat('/stats Yuishikawa')
  console.log('Bot Sent Chat')

  bot.quit()

  await new Promise<void>((resolve) => {
    bot.once('end', (reason) => {
      resolve()
      console.log('DC:', reason)
    })
  })

  bot.removeAllListeners()

  return {}
})
