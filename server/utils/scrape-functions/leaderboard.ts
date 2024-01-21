import type { Bot } from 'mineflayer'
import v from 'vec3'
import { goals, Movements } from 'mineflayer-pathfinder'
import type { Window } from 'prismarine-windows'
import type { Item } from 'prismarine-item'
import { once, on } from 'node:events'
import timer from 'node:timers/promises'
import pRetry from 'p-retry'

const LEADERBOARD_VIEW_POS = new goals.GoalBlock(-35, 101, -2.5)

const WINS_LEADERBOARD_POS = v(-36, 101, -8)
const KILLS_LEADERBOARD_POS = v(-36, 101, -14)

export const scrapeLeaderboard = async (bot: Bot, gamemode: string, timespan: string) => {
  const movement = new Movements(bot)
  movement.canDig = false

  bot.pathfinder.setMovements(movement)

  console.log('Bot: Moving To Leaderboard Area')

  await pRetry(async () => {
    await bot.pathfinder.goto(LEADERBOARD_VIEW_POS)
  }, {
    factor: 1,
    retries: 3,

  })

  console.log('Bot: Reached Leaderboard Area')

  const hologramBtn = bot.nearestEntity(e => e.displayName === 'Interaction')

  if (!hologramBtn)
    throw Error('Unable to find settings hologram.')

  console.log('Bot: Opening Hologram Settings')

  await bot.lookAt(hologramBtn.position)

  bot.attack(hologramBtn)

  const [settingsWindow] = await once(bot, 'windowOpen') as [Window<ItemWindowEvents>]

  console.log('Bot: Opened Hologram Settings')

  let modeBtn = settingsWindow.containerItems().find((item) => {
    return item.customName?.includes('Mode')
  })

  if (!modeBtn)
    throw Error('Unable to find mode button.')

  let settingsChanged = false

  const wantedGamemodeIdx = (modeBtn.customLore as string[]).findIndex(loreStr => loreStr.toLowerCase().includes(gamemode))

  while ((modeBtn.customLore as string[]).findIndex(loreStr => loreStr.includes('green')) !== wantedGamemodeIdx) {
    settingsChanged = true
    bot.simpleClick.leftMouse(modeBtn.slot)

    for await (const eventArr of on(settingsWindow, 'updateSlot')) {
      const newItem = eventArr[2] as Item
      if (newItem && newItem.customName?.includes('Mode')) {
        modeBtn = newItem
        break
      }
    }
    // this is necessary because the UI seems to be updated "optimistically"
    await timer.setTimeout(1000)
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
      if (newItem && newItem.customName?.includes('Select Time Span')) {
        timespanBtn = newItem
        break
      }
    }
    // this is necessary because the UI seems to be updated "optimistically"
    await timer.setTimeout(1000)
  }

  /* console.dir(modeBtn, { depth: null })
  console.dir(timespanBtn, { depth: null }) */

  const winsLeaderboardObjs: any[] = []
  const killsLeaderboardObjs: any[] = []

  bot.closeWindow(settingsWindow)

  if (settingsChanged) {
    // the reason we don't use 'entityUpdate' here is: it's difficult to determine exactly
    // how many holograms will update as sometimes a player will have the same position in 2
    // different settings (in which case there will be no update packet)
    await timer.setTimeout(4000)
  }

  console.log('Parsing Leaderboard JSON')

  Object.values(bot.entities).filter(e => e.displayName === 'Armor Stand').forEach((e) => {
    if (JSON.stringify(e.getCustomName()?.json)?.includes('-')) {
      if (e.position.xzDistanceTo(WINS_LEADERBOARD_POS) <= 2)
        winsLeaderboardObjs.push(e.getCustomName()?.json)

      if (e.position.xzDistanceTo(KILLS_LEADERBOARD_POS) <= 2)
        killsLeaderboardObjs.push(e.getCustomName()?.json)
    }
  })

  const leaderboardRes = {
    wins: await parseLeaderboard(winsLeaderboardObjs),
    kills: await parseLeaderboard(killsLeaderboardObjs),
  }

  return leaderboardRes
}
