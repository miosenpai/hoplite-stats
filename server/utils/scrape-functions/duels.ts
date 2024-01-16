import jsonata from 'jsonata'

export type KitStats = {
  gamesPlayed: number
  wins: number
  losses: number
  playtime: number
  kills: number
  deaths: number
  winLossRatio: number
  killDeathRatio: number
  currWinstreak: number
  bestWinstreak: number
}

export type DuelsStats = {
  casual: KitStats
  custom: KitStats
  private: KitStats
  sword: KitStats
  axe: KitStats
  crystal: KitStats
  uhc: KitStats
  roulette: KitStats
  potion: KitStats
  netherPot: KitStats
  archer: KitStats
  sumo: KitStats
}

const kitStatsQuery = jsonata(`$[customName.text = $kitNameText]{
  'gamesPlayed': $number(customLore[text = 'Games Played: '].extra.text),
  'wins': $number(customLore[text = 'Wins: '].extra.text),
  'losses': $number(customLore[text = 'Losses: '].extra.text),
  'playtime': $parsePlaytime(customLore[text = 'Playtime: '].extra.text),
  'kills': $number(customLore[text = 'Kills: '].extra.text),
  'deaths': $number(customLore[text = 'Deaths: '].extra.text),
  'winLossRatio': $number(customLore[text = 'W/L Ratio: '].extra.text),
  'killDeathRatio': $number(customLore[text = 'K/D Ratio: '].extra.text),
  'currWinStreak': $number(customLore[text = 'Current Winstreak: '].extra.text),
  'bestWinStreak': $number(customLore[text = 'Best Winstreak: '].extra.text)
}`)

kitStatsQuery.assign('parsePlaytime', parsePlaytime)

const parseKitStats = (statsWindowItems: any, kitName: string) => {
  return kitStatsQuery.evaluate(statsWindowItems, { kitNameText: `${kitName} Stats` })
}

export const parseDuelsStats = async (statsWindowItems: any) => {
  return {
    casual: await parseKitStats(statsWindowItems, 'Casual'),
    custom: await parseKitStats(statsWindowItems, 'Custom'),
    private: await parseKitStats(statsWindowItems, 'Private'),
    sword: await parseKitStats(statsWindowItems, 'Sword'),
    axe: await parseKitStats(statsWindowItems, 'Axe'),
    crystal: await parseKitStats(statsWindowItems, 'Crystal'),
    uhc: await parseKitStats(statsWindowItems, 'UHC'),
    roulette: await parseKitStats(statsWindowItems, 'Roulette Royale'),
    potion: await parseKitStats(statsWindowItems, 'Potion'),
    netherPot: await parseKitStats(statsWindowItems, 'NetherPot'),
    archer: await parseKitStats(statsWindowItems, 'Archer'),
    sumo: await parseKitStats(statsWindowItems, 'Sumo'),
  } as DuelsStats
}
