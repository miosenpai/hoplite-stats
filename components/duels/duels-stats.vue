<template>
  <div
    :class="[
      // 'flex py-6 gap-6 items-center'
      'grid',
      'profile-grid',
      'gap-6',
      'py-6'
    ]"
  >
    <img
      :src="`https://minotar.net/avatar/${props.username}`"
      class="min-h-full aspect-square"
    >
    <LadderStatsPanel v-bind="props" />
  </div>
  <div
    :class="[
      'grid grid-cols-2',
      'gap-6',
      'pb-6'
    ]"
  >
    <KitStatsPanel
      class-name="Sword"
      v-bind="props.sword"
    />
    <KitStatsPanel
      class-name="Axe"
      v-bind="props.axe"
    />
    <KitStatsPanel
      class-name="Crystal"
      v-bind="props.crystal"
    />
    <KitStatsPanel
      class-name="UHC"
      v-bind="props.uhc"
    />
    <KitStatsPanel
      class-name="Roulette Royale"
      v-bind="props.roulette"
    />
    <KitStatsPanel
      class-name="Potion"
      v-bind="props.potion"
    />
    <KitStatsPanel
      class-name="Nether Pot"
      v-bind="props.netherPot"
    />
    <KitStatsPanel
      class-name="Archer"
      v-bind="props.archer"
    />
    <KitStatsPanel
      class-name="Sumo"
      v-bind="props.sumo"
    />
  </div>
</template>

<script setup lang="ts">
import type { DuelsStats } from '~/server/utils/parsers/duels'

const props = defineProps<DuelsStats & { username: string }>()

</script>

<style scoped>
.profile-grid {
  grid-template-columns: max-content auto;
}
</style>
