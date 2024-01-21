import jsonata from 'jsonata'

export type OverallStats = {
  games: number
  wins: number
  kills: number
  assists: number
  // seconds
  playtime: number
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
  total: OverallStats
  solo: OverallStats
  civ: OverallStats
  legendaryCrafts: number
  legendaryKills: number
  // seconds
  avgTimeSurvived: number
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

const overallStatsQuery = jsonata(`$[customName.text = 'Overall Stats']{
  'total': {
    'games': $number(customLore[text = 'Games Played: '].extra.text),
    'wins': $number(customLore[text = 'Total Wins: '].extra.text),
    'kills': $number(customLore[text = 'Total Kills: '].extra.text),
    'assists': $number(customLore[text = 'Total Assists: '].extra.text),
    'playtime': $parsePlaytime(customLore[text = 'Total Playtime: '].extra.text)
  },
  'solo': {
    'games': $number(customLore[text = 'Solo Games Played: '].extra.text),
    'wins': $number(customLore[text = 'Solo Wins: '].extra.text),
    'kills': $number(customLore[text = 'Solo Kills: '].extra.text),
    'assists': $number(customLore[text = 'Solo Assists: '].extra.text),
    'playtime': $parsePlaytime(customLore[text = 'Solo Playtime: '].extra.text)
  },
  'civ': {
    'games': $number(customLore[text = 'Civ Games Played: '].extra.text),
    'wins': $number(customLore[text = 'Civ Wins: '].extra.text),
    'kills': $number(customLore[text = 'Civ Kills: '].extra.text),
    'assists': $number(customLore[text = 'Civ Assists: '].extra.text),
    'playtime': $parsePlaytime(customLore[text = 'Civ Playtime: '].extra.text)
  },
  'legendaryCrafts': $number(customLore[text = 'Legendary Weapons Crafted: '].extra.text),
  'legendaryKills': $number(customLore[text = 'Legendary Weapon Kills: '].extra.text),
  'avgTimeSurvived': $parsePlaytime(customLore[text = 'Average Time Survived: '].extra.text)
}`)

overallStatsQuery.assign('parsePlaytime', parsePlaytime)

const parseClassStats = (brStatsItems: any, className: string) => {
  return classStatsQuery.evaluate(brStatsItems, { classNameText: `${className} Stats` }) as Promise<ClassStats>
}

export const parseBattleRoyaleStats = async (brStatsItems: any): Promise<BattleRoyaleStats> => {
  const overallStats = await overallStatsQuery.evaluate(brStatsItems) as OverallStatsFields

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
