import jsonata from 'jsonata'

export type OverallStats = {
  games: number
  wins: number
  kills: number
  assists: number
  // seconds
  playtime: number
  customCrafts: number
  legendaryCrafts: number
  legendaryKills: number
  avgTimeSurvived: number
}

export type ClassStats = {
  wins: number
  losses: number
  kills: number
  deaths: number
  assists: number
  // seconds
  playtime: number
  winLoseRatio: number
  killDeathRatio: number
}

export type OverallStatsFields = {
  solo: OverallStats
  civ: OverallStats
  overall: OverallStats
}

export type ClassStatsFields = {
  miner: ClassStats
  warrior: ClassStats
  trapper: ClassStats
  archer: ClassStats
  looter: ClassStats
}

export type BattleRoyaleStats = OverallStatsFields & ClassStatsFields

const classStatsQuery = jsonata(`$[customName.text = $classNameText]{
  'wins': $number(customLore[text = 'Wins: '].extra.text),
  'losses': $number(customLore[text = 'Losses: '].extra.text),
  'kills': $number(customLore[text = 'Kills: '].extra.text),
  'deaths': $number(customLore[text = 'Deaths: '].extra.text),
  'assists': $number(customLore[text = 'Assists: '].extra.text),
  'playtime': $parsePlaytime(customLore[text = 'Playtime: '].extra.text),
  'winLoseRatio': $number(customLore[text = 'W/L Ratio: '].extra.text),
  'killDeathRatio': $number(customLore[text = 'K/D Ratio: '].extra.text)
}`)

classStatsQuery.assign('parsePlaytime', parsePlaytime)

const overallStatsQuery = jsonata(`$[customName.text = $queueNameText]{
  'games': $number(customLore[text = 'Games Played: '].extra.text),
  'wins': $number(customLore[text = 'Wins: '].extra.text),
  'kills': $number(customLore[text = 'Kills: '].extra.text),
  'assists': $number(customLore[text = 'Assists: '].extra.text),
  'playtime': $parsePlaytime(customLore[text = 'Playtime: '].extra.text),
  'customCrafts': $number(customLore[text = 'Custom Crafts Crafted: '].extra.text),
  'legendaryCrafts': $number(customLore[text = 'Legendary Weapons Crafted: '].extra.text),
  'legendaryKills': $number(customLore[text = 'Legendary Weapon Kills: '].extra.text),
  'avgTimeSurvived': $parsePlaytime(customLore[text = 'Average Time Survived: '].extra.text)
}`)

overallStatsQuery.assign('parsePlaytime', parsePlaytime)

const parseClassStats = (brStatsItems: any, className: string) => {
  return classStatsQuery.evaluate(brStatsItems, { classNameText: `${className} Stats` }) as Promise<ClassStats>
}

const parseOverallStats = (overallStatsItems: any, queueName: string) => {
  return overallStatsQuery.evaluate(overallStatsItems, { queueNameText: `${queueName} Stats` }) as Promise<OverallStats>
}

export const parseBattleRoyaleStats = async (brStatsItems: any): Promise<BattleRoyaleStats> => {
  const overallStats: OverallStatsFields = {
    solo: await parseOverallStats(brStatsItems, 'Solo'),
    civ: await parseOverallStats(brStatsItems, 'Civilization'),
    overall: await parseOverallStats(brStatsItems, 'Overall'),
  }

  const classStats: ClassStatsFields = {
    miner: await parseClassStats(brStatsItems, 'Miner'),
    warrior: await parseClassStats(brStatsItems, 'Warrior'),
    trapper: await parseClassStats(brStatsItems, 'Trapper'),
    archer: await parseClassStats(brStatsItems, 'Archer'),
    looter: await parseClassStats(brStatsItems, 'Looter'),
  }

  return {
    ...overallStats,
    ...classStats,
  }
}
