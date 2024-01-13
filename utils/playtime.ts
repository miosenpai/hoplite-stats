export function formatPlaytime(seconds: number) {
  const playtimeObj = dayjs.duration(seconds, 'seconds')
  return playtimeObj.format('D:HH:mm')
}
