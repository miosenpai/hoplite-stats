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
  battleRoyale: KitStats
  axe: KitStats
  crystal: KitStats
  archer: KitStats
  potion: KitStats
  netherPot: KitStats
  boxing: KitStats
  bridge: KitStats
  parkour: KitStats
  // uhc: KitStats
  // roulette: KitStats
  // sumo: KitStats
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
  'currWinstreak': $number(customLore[text = 'Current Winstreak: '].extra.text),
  'bestWinstreak': $number(customLore[text = 'Best Winstreak: '].extra.text)
}`)

kitStatsQuery.assign('parsePlaytime', parsePlaytime)

const parseKitStats = (statsWindowItems: any, kitName: string) => {
  return kitStatsQuery.evaluate(statsWindowItems, { kitNameText: `${kitName} Stats` })
}

export const parseDuelsStats = async (statsWindowItems: any): Promise<DuelsStats> => {
  return {
    casual: await parseKitStats(statsWindowItems, 'Casual'),
    custom: await parseKitStats(statsWindowItems, 'Custom Kit'),
    private: await parseKitStats(statsWindowItems, 'Private'),
    sword: await parseKitStats(statsWindowItems, 'Sword'),
    battleRoyale: await parseKitStats(statsWindowItems, 'Battle Royale'),
    axe: await parseKitStats(statsWindowItems, 'Axe'),
    crystal: await parseKitStats(statsWindowItems, 'Crystal'),
    archer: await parseKitStats(statsWindowItems, 'Archer'),
    potion: await parseKitStats(statsWindowItems, 'Potion'),
    netherPot: await parseKitStats(statsWindowItems, 'NetherPot'),
    boxing: await parseKitStats(statsWindowItems, 'Boxing'),
    bridge: await parseKitStats(statsWindowItems, 'Bridge'),
    parkour: await parseKitStats(statsWindowItems, 'Parkour'),
  }
}
