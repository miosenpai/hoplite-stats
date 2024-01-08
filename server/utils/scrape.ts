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

export type BrStats = OverallStatsFields & ClassStatsFields

function scrapeClassStats(brStatsItems: any, className: string) {
  const classStatsQuery = jsonata(`$[customName.text = '${className} Stats']{
    'wins': $number(customLore[text = 'Wins: '].extra.text),
    'losses': $number(customLore[text = 'Losses: '].extra.text),
    'kills': $number(customLore[text = 'Kills: '].extra.text),
    'deaths': $number(customLore[text = 'Deaths: '].extra.text),
    'assists': $number(customLore[text = 'Assists: '].extra.text),
    'playtime': customLore[text = 'Playtime: '].extra.text,
    'winLoseRatio': $number(customLore[text = 'W/L Ratio: '].extra.text),
    'killDeathRatio': $number(customLore[text = 'K/D Ratio: '].extra.text)
  }`)

  return classStatsQuery.evaluate(brStatsItems) as Promise<ClassStats>
}

async function scrapeBrStats(brStatsItems: any): Promise<BrStats> {
  const overallStatsQuery = jsonata(`$[customName.text = 'Overall Stats']{
    'total': {
      'games': $number(customLore[text = 'Games Played: '].extra.text),
      'wins': $number(customLore[text = 'Total Wins: '].extra.text),
      'kills': $number(customLore[text = 'Total Kills: '].extra.text),
      'assists': $number(customLore[text = 'Total Assists: '].extra.text),
      'playtime': customLore[text = 'Total Playtime: '].extra.text
    },
    'solo': {
      'games': $number(customLore[text = 'Solo Games Played: '].extra.text),
      'wins': $number(customLore[text = 'Solo Wins: '].extra.text),
      'kills': $number(customLore[text = 'Solo Kills: '].extra.text),
      'assists': $number(customLore[text = 'Solo Assists: '].extra.text),
      'playtime': customLore[text = 'Solo Playtime: '].extra.text
    },
    'civ': {
      'games': $number(customLore[text = 'Civ Games Played: '].extra.text),
      'wins': $number(customLore[text = 'Civ Wins: '].extra.text),
      'kills': $number(customLore[text = 'Civ Kills: '].extra.text),
      'assists': $number(customLore[text = 'Civ Assists: '].extra.text),
      'playtime': customLore[text = 'Civ Playtime: '].extra.text
    },
    'legendaryCrafts': $number(customLore[text = 'Legendary Weapons Crafted: '].extra.text),
    'legendaryKills': $number(customLore[text = 'Legendary Weapon Kills: '].extra.text),
    'avgTimeSurvived': customLore[text = 'Average Time Survived: '].extra.text
  }`)

  const overallStats = await overallStatsQuery.evaluate(brStatsItems) as OverallStatsFields

  const classStats: ClassStatsFields = {
    miner: await scrapeClassStats(brStatsItems, 'Miner'),
    warrior: await scrapeClassStats(brStatsItems, 'Warrior'),
    trapper: await scrapeClassStats(brStatsItems, 'Trapper'),
    archer: await scrapeClassStats(brStatsItems, 'Archer'),
    looter: await scrapeClassStats(brStatsItems, 'Looter'),
  }

  return {
    ...overallStats,
    ...classStats,
  }
}

export function useScrapeFunctions() {
  return {
    scrapeBrStats,
  }
}
