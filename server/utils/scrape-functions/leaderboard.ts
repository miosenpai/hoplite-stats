import type { Bot } from 'mineflayer'
import v from 'vec3'
import { goals } from 'mineflayer-pathfinder'
import timer from 'node:timers/promises'

export type BattleRoyaleLeaderboard = {
  wins: LeaderboardEntry[]
  kills: LeaderboardEntry[]
}

export type DuelsLeaderboard = {
  wins: LeaderboardEntry[]
  streaks: LeaderboardEntry[]
}

const BR_LEADERBOARD_VIEW_POS = new goals.GoalBlock(-35, 101, -2.5)
const DUELS_LEADERBOARD_VIEW_POS = new goals.GoalBlock(7, 99, 67)

const BR_WINS_LEADERBOARD_POS = v(-36, 101, -8)
const BR_KILLS_LEADERBOARD_POS = v(-36, 101, -14)

const DUELS_WINS_LEADERBOARD_POS = v(9, 99, 72)
const DUELS_STREAKS_LEADERBOARD_POS = v(9, 99, 76)

export const scrapeBattleRoyaleLeaderboard = async (bot: Bot, gamemode: string, timespan: string) => {
  await changeLobby(bot, 'battle-royale')

  const settingsWindow = await openHologramWindow(bot, BR_LEADERBOARD_VIEW_POS)

  const modeCfgChanged = await cycleConfigBtn(bot, settingsWindow, 'Mode', gamemode)
  const timespanCfgChanged = await cycleConfigBtn(bot, settingsWindow, 'Select Time Span', timespan)

  bot.closeWindow(settingsWindow)

  if (modeCfgChanged || timespanCfgChanged) {
    // the reason we don't use 'entityUpdate' here is: it's difficult to determine exactly
    // how many holograms will update as sometimes a player will have the same position in 2
    // different settings (in which case there will be no update packet)
    await timer.setTimeout(4000)
  }

  console.log('Parsing Leaderboard JSON')

  const winsLeaderboardObjs = Object.values(bot.entities)
    .filter(e => e.position.xzDistanceTo(BR_WINS_LEADERBOARD_POS) <= 2 && e.displayName === 'Text Display')
    .map(e => JSON.parse(`${e.metadata.at(-2)}`))
    .reverse()

  const killsLeaderboardObjs = Object.values(bot.entities)
    .filter(e => e.position.xzDistanceTo(BR_KILLS_LEADERBOARD_POS) <= 2 && e.displayName === 'Text Display')
    .map(e => JSON.parse(`${e.metadata.at(-2)}`))
    .reverse()

  const leaderboardRes: BattleRoyaleLeaderboard = {
    wins: await parseEntityLeaderboard(winsLeaderboardObjs),
    kills: await parseEntityLeaderboard(killsLeaderboardObjs),
  }

  return leaderboardRes
}

export const scrapeDuelsLeaderboard = async (bot: Bot, kit: string, teamSize: number, timespan: string) => {
  await changeLobby(bot, 'duels')

  const settingsWindow = await openHologramWindow(bot, DUELS_LEADERBOARD_VIEW_POS)

  const kitCfgChanged = await cycleConfigBtn(bot, settingsWindow, 'Select Kit', kit.split('-')[0])
  const teamSizeCfgChanged = await cycleConfigBtn(bot, settingsWindow, 'Select Team Size', `${teamSize}v${teamSize}`)
  const timespanCfgChanged = await cycleConfigBtn(bot, settingsWindow, 'Select Time Span', timespan)

  bot.closeWindow(settingsWindow)

  if (kitCfgChanged || teamSizeCfgChanged || timespanCfgChanged) {
    await timer.setTimeout(4000)
  }

  console.log('Parsing Leaderboard JSON')

  const winsLeaderboardObjs = Object.values(bot.entities)
    .filter(e => e.position.xzDistanceTo(DUELS_WINS_LEADERBOARD_POS) <= 2 && e.displayName === 'Text Display')
    .map(e => JSON.parse(`${e.metadata.at(-2)}`))
    .reverse()

  const streaksLeaderboardObjs = Object.values(bot.entities)
    .filter(e => e.position.xzDistanceTo(DUELS_STREAKS_LEADERBOARD_POS) <= 2 && e.displayName === 'Text Display')
    .map(e => JSON.parse(`${e.metadata.at(-2)}`))
    .reverse()

  return {
    wins: await parseEntityLeaderboard(winsLeaderboardObjs),
    streaks: await parseEntityLeaderboard(streaksLeaderboardObjs),
  } as DuelsLeaderboard
}
