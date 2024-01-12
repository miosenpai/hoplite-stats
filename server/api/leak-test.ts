import mineflayer from 'mineflayer'
import { once } from 'node:events'

export default defineEventHandler(async () => {
  const runtimeCfg = useRuntimeConfig()

  const bot = mineflayer.createBot({
    username: runtimeCfg.bot.authName,
    host: runtimeCfg.bot.serverHost,
    auth: 'microsoft',
    profilesFolder: runtimeCfg.bot.profilesDir,
  })

  await once(bot, 'spawn')
  await once(bot, 'spawn')

  bot.chat('/stats Yuishikawa')

  bot.quit()

  return {}
})
