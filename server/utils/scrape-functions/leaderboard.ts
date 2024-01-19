import { type Bot } from 'mineflayer'
import v from 'vec3'
import { goals, Movements } from 'mineflayer-pathfinder'
import { type ChatMessage } from 'prismarine-chat'
import { type Window } from 'prismarine-windows'
import { once } from 'node:events'

const LEADERBOARD_VIEW_POS = new goals.GoalXZ(-35.5, -2.5)

const WINS_LEADERBOARD_POS = v(-36, 101, -8)
const KILLS_LEADERBOARD_POS = v(-36, 101, -14)

export const scrapeLeaderboard = async (bot: Bot, gamemode: string, timeframe: string) => {
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

  const [settingsWindow] = await once(bot, 'windowOpen') as [Window]

  console.log('Bot: Opened Hologram Settings')

  const modeBtn = settingsWindow.containerItems().find((item) => {
    if (item.customName) {
      const customItemObj = JSON.parse(item.customName) as CustomName
      return customItemObj.text === 'Mode'
    }
    return false
  })

  if (!modeBtn)
    throw Error('Unable to find mode button.')

  const timespanBtn = settingsWindow.containerItems().find((item) => {
    if (item.customName) {
      const customItemObj = JSON.parse(item.customName) as CustomName
      return customItemObj.text === 'Select Time Span'
    }
    return false
  })

  if (!timespanBtn)
    throw Error('Unable to find timespan button.')

  console.dir(modeBtn)
  console.dir(timespanBtn)

  bot.closeWindow(settingsWindow)

  return

  const killsLeaderboardObjs: any[] = []

  Object.values(bot.entities).filter(e => e.displayName === 'Armor Stand').forEach((e) => {
    // console.log(e.getCustomName())
    // console.dir(e.getCustomName(), { depth: null })

    const dist = e.position.xzDistanceTo(WINS_LEADERBOARD_POS)
    const customName = e.getCustomName()

    if (dist <= 2 && customName) {
      // console.dir(e.getCustomName(), { depth: null })
      killsLeaderboardObjs.push(customName.json)
    }
  })

  const leaderboardRes = await parseLeaderboard(killsLeaderboardObjs)

  console.log(leaderboardRes)
}
