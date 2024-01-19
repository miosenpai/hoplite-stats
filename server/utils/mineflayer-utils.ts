import type { Item } from 'prismarine-item'

export type CustomName = {
  italic: boolean
  color: string
  text: string
}

export type ItemWindowEvents = {
  updateSlot: (slot: number, oldItem: Item, newItem: Item) => Promise<void> | void
}
