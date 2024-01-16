import { default as dayjsLib } from 'dayjs'
import duration from 'dayjs/plugin/duration.js'

dayjsLib.extend(duration)

export const dayjs = dayjsLib

export const parsePlaytime = (playtimeStr: string) => {
  const playtimeStrArr = playtimeStr.split(':')
  return dayjs.duration({
    days: parseInt(playtimeStrArr[0]),
    hours: parseInt(playtimeStrArr[1]),
    minutes: parseInt(playtimeStrArr[2]),
    seconds: parseInt(playtimeStrArr[3]),
  }).asSeconds()
}
