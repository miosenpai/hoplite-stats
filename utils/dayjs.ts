import { default as dayjsLib } from 'dayjs'
import duration from 'dayjs/plugin/duration.js'

dayjsLib.extend(duration)

export const dayjs = dayjsLib

export function formatPlaytime(seconds: number) {
  const playtimeObj = dayjs.duration(seconds, 'seconds')
  return playtimeObj.format('D:HH:mm')
}
