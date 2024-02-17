import type { Bot } from 'mineflayer'
import type { Window } from 'prismarine-windows'
import { once, on } from 'node:events'
import type { Item } from 'prismarine-item'
import type { goals } from 'mineflayer-pathfinder'
import pRetry from 'p-retry'
import pTimeout from 'p-timeout'
import timer from 'node:timers/promises'

export const changeLobby = async (bot: Bot, dest: 'battle-royale' | 'duels') => {
  const currLobby = bot.inventory.items().find(item => item.customName?.includes('Recipe Book')) ? 'battle-royale' : 'duels'

  if (currLobby === dest) {
    console.log(`Bot: Already In '${dest}' Lobby`)
    return
  }

  console.log(`Bot: Switching Lobby To '${dest}'`)

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

  console.log(`Bot: Switched Lobby To '${dest}'`)
}

export const openHologramWindow = async (bot: Bot, nearestLocation: goals.Goal) => {
  console.log('Bot: Moving To Leaderboard Area')

  await pRetry(async () => {
    await bot.pathfinder.goto(nearestLocation)
  }, {
    factor: 1,
    retries: 3,
  })

  console.log('Bot: Reached Leaderboard Area')

  const hologramBtn = bot.nearestEntity(e => e.displayName === 'Interaction')

  if (!hologramBtn)
    throw Error('Unable to find settings hologram.')

  console.log('Bot: Opening Hologram Settings')

  const settingsWindow = await pRetry(async () => {
    await bot.lookAt(hologramBtn.position, true)

    bot.attack(hologramBtn)

    const win = (await pTimeout(once(bot, 'windowOpen'), { milliseconds: 2000 }))[0] as Window<ItemWindowEvents>
    return win
  }, {
    factor: 1,
    retries: 3,
    minTimeout: 2500,
  })

  console.log('Bot: Opened Hologram Settings')
  return settingsWindow
}

export const cycleConfigBtn = async (bot: Bot, configWindow: Window<ItemWindowEvents>, configName: string, desiredConfigStr: string) => {
  let configBtn = configWindow.containerItems().find(item => item.customName?.includes(configName))

  if (!configBtn)
    throw Error(`Unable To Find Config Button: '${configName}'`)

  let configChanged = false

  const wantedConfigIdx = (configBtn.customLore as string[]).findIndex(loreStr => loreStr.toLowerCase().includes(desiredConfigStr))

  while ((configBtn.customLore as string[]).findIndex(loreStr => loreStr.includes('green')) !== wantedConfigIdx) {
    configChanged = true
    bot.simpleClick.leftMouse(configBtn.slot)

    for await (const eventArr of on(configWindow, 'updateSlot')) {
      const newItem = eventArr[2] as Item
      if (newItem && newItem.customName?.includes(configName)) {
        configBtn = newItem
        break
      }
    }
    // this is necessary because the UI seems to be updated "optimistically"
    await timer.setTimeout(1000)
  }

  return configChanged
}
