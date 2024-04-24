import jsonata from 'jsonata'

const standLeaderboardQuery = jsonata(`$[[1..10]].{
  'username': $trim(extra[-3].text),
  'value': $number(extra[-1].text)
}`)

const entityLeaderboardQuery = jsonata(`$[[2..11]].**[extra.text='- '].{
  'username': $trim($.text),
  'value': $number($.extra.extra.text)
}`)

export type LeaderboardEntry = {
  username: string
  value: number
}

export const parseStandLeaderboard = async (leaderboardData: any) => {
  const parseRes = await standLeaderboardQuery.evaluate(leaderboardData)

  // workaround for https://github.com/jsonata-js/jsonata/issues/296
  return JSON.parse(JSON.stringify(parseRes)) as LeaderboardEntry[]
}

export const parseEntityLeaderboard = async (leaderboardData: any) => {
  const parseRes = await entityLeaderboardQuery.evaluate(leaderboardData)

  // workaround for https://github.com/jsonata-js/jsonata/issues/296
  return JSON.parse(JSON.stringify(parseRes)) as LeaderboardEntry[]
}
