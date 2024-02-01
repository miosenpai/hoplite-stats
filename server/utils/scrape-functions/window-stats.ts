import type { Bot } from 'mineflayer'
import type { Window } from 'prismarine-windows'
import type { ChatMessage } from 'prismarine-chat'
import { on, once } from 'node:events'

const STATS_BTN_MAP = {
  'battle-royale': 'Battle Royale Stats',
  'duels': 'Duels Stats',
}

const STATS_ITEMS_COUNT = {
  'battle-royale': 6,
  'duels': 14,
}

const ERROR_CHAT_PATTERNS = [
  'An unexpected error occurred. Please try again later!',
  `You cannot view this player's profile due to their privacy settings!`,
]

export const scrapeWindowStats = async (bot: Bot, username: string, category: 'battle-royale' | 'duels') => {
  console.log('Bot: /stats', username)
  bot.chat(`/stats ${username}`)

  const statsErrMsg = new AbortController()

  const errMsgObserver = (jsonMsg: ChatMessage, position: string) => {
    if (position === 'system') {
      const isErrMsg = ERROR_CHAT_PATTERNS.some(pattern => jsonMsg.extra?.at(1)?.toString().endsWith(pattern))
      if (isErrMsg)
        statsErrMsg.abort()
    }
  }

  bot.on('message', errMsgObserver)

  let statsMenu = null

  try {
    statsMenu = (await once(bot, 'windowOpen', { signal: statsErrMsg.signal }))[0] as Window
  } catch (err) {
    throw Error(ScrapeError.NO_HOPLITE_PROFILE)
  } finally {
    bot.removeListener('message', errMsgObserver)
  }

  const statsBtn = statsMenu.containerItems().find((item) => {
    if (item.customName) {
      const customNameObj = JSON.parse(item.customName) as CustomName
      return customNameObj.text === STATS_BTN_MAP[category]
    }
    return false
  })

  if (!statsBtn)
    throw Error(`'${category}' stats button not found.`)

  console.log(`Bot: '${category}' Stats Button Found`)
  bot.simpleClick.leftMouse(statsBtn.slot)

  const [statsWindow] = await once(bot, 'windowOpen') as [Window<ItemWindowEvents>]
  console.log(`Bot: '${category}' Stats Window Opened`)

  let pendingUpdates = STATS_ITEMS_COUNT[category]
  // todo: timeout protection (in case # of stats items decreases/changes)
  for await (const _ of on(statsWindow, 'updateSlot')) {
    pendingUpdates -= 1

    if (pendingUpdates === 0)
      break
  }

  console.log('Bot: Finished Waiting For Stats Items')

  const statsWindowItems = statsWindow.containerItems().map((item) => {
    return {
      customName: JSON.parse(item.customName!), // JSON.parse can handle null
      customLore: (item.customLore as string[] | null)?.map(loreStr => JSON.parse(loreStr)),
    }
  })

  bot.closeWindow(statsWindow)

  console.log('Bot: Parsing Stats Items')

  switch (category) {
    case 'battle-royale':
      return parseBattleRoyaleStats(statsWindowItems)
    case 'duels':
      return parseDuelsStats(statsWindowItems)
  }
}
