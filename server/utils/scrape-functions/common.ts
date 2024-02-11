import type { Bot } from 'mineflayer'
import type { Window } from 'prismarine-windows'
import { once, on } from 'node:events'
import type { Item } from 'prismarine-item'

export const changeLobby = async (bot: Bot, dest: 'battle-royale' | 'duels') => {
  const currLobby = bot.inventory.items().find(item => item.customName?.includes('Recipe Book')) ? 'battle-royale' : 'duels'

  if (currLobby === dest)
    return

  bot.chat('/navigation')

  const [navWindow] = await once(bot, 'windowOpen') as [Window<ItemWindowEvents>]

  const destBtnName = dest === 'battle-royale' ? 'Battle Royale' : 'Duels'

  let destNavBtn = null

  for await (const eventArr of on(navWindow, 'updateSlot')) {
    const newItem = eventArr[2] as Item
    if (newItem && newItem.customName?.includes(destBtnName)) {
      destNavBtn = newItem
      break
    }
  }

  bot.simpleClick.leftMouse(destNavBtn!.slot)

  // respawn event fires when switching lobbies
  await once(bot, 'respawn')
}
