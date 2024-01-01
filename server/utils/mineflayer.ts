import mineflayer from 'mineflayer'

const bot = mineflayer.createBot({
  host: 'hoplite.gg',
  username: ''
})

bot.on('resourcePack', (url, hash) => {
  bot.acceptResourcePack()
})

bot.once('spawn', () => {
  console.log('Bot spawned in.')
})

bot.on('kicked', console.log)
bot.on('error', console.log)

export function useMineflayer() {
  return bot;
}