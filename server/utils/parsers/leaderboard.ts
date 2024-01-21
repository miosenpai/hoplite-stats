import jsonata from 'jsonata'

const leaderboardQuery = jsonata(`$[[1..10]].{
  'username': $trim(extra[-3].text),
  'value': $number(extra[-1].text)
}`)

type LeaderboardEntry = {
  username: string
  value: number
}

export const parseLeaderboard = async (leaderboardData: any) => {
  const parseRes = await leaderboardQuery.evaluate(leaderboardData)

  // workaround for https://github.com/jsonata-js/jsonata/issues/296
  return JSON.parse(JSON.stringify(parseRes)) as LeaderboardEntry[]
}
