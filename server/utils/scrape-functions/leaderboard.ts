import type { Bot } from 'mineflayer'
import v from 'vec3'
import { goals, Movements } from 'mineflayer-pathfinder'
import type { Window } from 'prismarine-windows'
import type { Item } from 'prismarine-item'
import type { Entity } from 'prismarine-entity'
import { once, on } from 'node:events'
import type { ChatMessage } from 'prismarine-chat'
import timers from 'node:timers/promises'

const LEADERBOARD_VIEW_POS = new goals.GoalXZ(-35.5, -2.5)

const WINS_LEADERBOARD_POS = v(-36, 101, -8)
const KILLS_LEADERBOARD_POS = v(-36, 101, -14)

export const scrapeLeaderboard = async (bot: Bot, gamemode: string, timespan: string) => {
  console.log(`scraping leaderboard:`, { gamemode, timespan })

  const movement = new Movements(bot)
  movement.canDig = false

  bot.pathfinder.setMovements(movement)

  console.log('Bot: Moving To Leaderboard Area')

  // const pos = new goals.GoalGetToBlock(-58, 63, -45)

  const pos = new goals.GoalXZ(-35, -3)

  await bot.pathfinder.goto(pos)

  console.log('Bot: Reached Leaderboard Area')

  // await bot.look(degreesToRadians(-179), degreesToRadians(6))

  await bot.lookAt(v(-35.5, 102, -2.5))

  // const e = bot.nearestEntity(e => e.displayName === 'Armor Stand')!

  // await bot.lookAt(e.position)

  // how we find the settings window "click hitbox", "Interaction" display name should be unique
  const filtered = Object.values(bot.entities).filter((entity) => {
    return entity.position.xzDistanceTo(bot.entity.position) <= 3 && entity.displayName === 'Interaction'
  })

  if (filtered.length < 1)
    throw Error('Unable to find settings hologram.')

  console.log('Bot: Opening Hologram Settings')

  bot.attack(filtered[0])

  const [settingsWindow] = await once(bot, 'windowOpen') as [Window<ItemWindowEvents>]

  console.log('Bot: Opened Hologram Settings')

  let modeBtn = settingsWindow.containerItems().find((item) => {
    return item.customName?.includes('Mode')
  })

  if (!modeBtn) {
    throw Error('Unable to find mode button.')
  }

  let settingsChanged = false

  const wantedGamemodeIdx = (modeBtn.customLore as string[]).findIndex(loreStr => loreStr.toLowerCase().includes(gamemode))

  while ((modeBtn.customLore as string[]).findIndex(loreStr => loreStr.includes('green')) !== wantedGamemodeIdx) {
    settingsChanged = true
    bot.simpleClick.leftMouse(modeBtn.slot)

    for await (const eventArr of on(settingsWindow, 'updateSlot')) {
      const newItem = eventArr[2] as Item
      if (!newItem)
        continue
      if (newItem.customName?.includes('Mode')) {
        modeBtn = newItem
        break
      }
    }
  }

  let timespanBtn = settingsWindow.containerItems().find((item) => {
    return item.customName?.includes('Select Time Span')
  })

  if (!timespanBtn)
    throw Error('Unable to find timespan button.')

  const wantedTimespanIdx = (timespanBtn.customLore as string[]).findIndex(loreStr => loreStr.toLowerCase().includes(timespan))

  while ((timespanBtn.customLore as string[]).findIndex(loreStr => loreStr.includes('green')) !== wantedTimespanIdx) {
    settingsChanged = true
    bot.simpleClick.leftMouse(timespanBtn.slot)

    for await (const eventArr of on(settingsWindow, 'updateSlot')) {
      const newItem = eventArr[2] as Item
      if (!newItem)
        continue
      if (newItem.customName?.includes('Select Time Span')) {
        timespanBtn = newItem
        break
      }
    }
  }

  console.dir(settingsWindow.containerItems())

  bot.closeWindow(settingsWindow)

  // future: create a promise that resolves based on the successful chat message,
  // technically, waiting a bit longer here helps with avoiding the hologram plugin cooldown
  // await timers.setTimeout(500)

  /* console.log('waiting for hologram updates')
  for await (const eventArr of on(bot, 'message')) {
    const [jsonMsg, position] = eventArr as [ChatMessage, string]
    if (position === 'system') {
      console.dir(jsonMsg, { depth: null })
      break
    }
  } */

  let pendingUpdates = settingsChanged ? 24 : 0

  if (pendingUpdates > 0) {
    for await (const eventArr of on(bot, 'entityUpdate')) {
      if ((eventArr[0] as Entity).displayName === 'Armor Stand') {
        console.log(eventArr[0])
        console.log('armor stand updated')
        pendingUpdates -= 1
      }

      if (pendingUpdates === 0)
        break
    }
  }

  // await timers.setTimeout(2000)

  const winsLeaderboardObjs: any[] = []

  Object.values(bot.entities).filter(e => e.displayName === 'Armor Stand').forEach((e) => {
    // console.log(e.getCustomName())
    // console.dir(e.getCustomName(), { depth: null })

    const dist = e.position.xzDistanceTo(WINS_LEADERBOARD_POS)
    const customName = e.getCustomName()

    if (dist <= 2 && customName) {
      // console.dir(e.getCustomName(), { depth: null })
      winsLeaderboardObjs.push(customName.json)
    }
  })

  const leaderboardRes = await parseLeaderboard(winsLeaderboardObjs)

  console.log(leaderboardRes)

  return leaderboardRes
}
