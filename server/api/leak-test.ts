import mineflayer from 'mineflayer'
import { once } from 'node:events'

export default defineEventHandler(async () => {
  const runtimeCfg = useRuntimeConfig()

  const bot = mineflayer.createBot({
    username: runtimeCfg.bot.authName,
    host: runtimeCfg.bot.serverHost,
    auth: 'microsoft',
    profilesFolder: runtimeCfg.bot.profilesDir || undefined,
  })

  bot.on('resourcePack', () => {
    console.log('Resource Pack: Accepting')
    bot.acceptResourcePack()
  })

  bot.on('kicked', console.log)
  bot.on('error', console.log)

  await once(bot, 'spawn')
  console.log('Joined Queue')

  await once(bot, 'spawn')
  console.log('Joined Lobby')

  bot.chat('/stats Yuishikawa')

  bot.removeAllListeners()

  bot.quit()

  return {}
})
