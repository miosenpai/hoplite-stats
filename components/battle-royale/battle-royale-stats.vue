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
    <OverallStatsPanel v-bind="props" />
  </div>
  <div
    :class="[
      'grid grid-cols-2',
      'gap-6',
      'pb-6'
    ]"
  >
    <ClassStatsPanel
      v-bind="props.miner"
      class-name="Miner"
    />
    <ClassStatsPanel
      v-bind="props.warrior"
      class-name="Warrior"
    />
    <ClassStatsPanel
      v-bind="props.trapper"
      class-name="Trapper"
    />
    <ClassStatsPanel
      v-bind="props.archer"
      class-name="Archer"
    />
    <ClassStatsPanel
      v-bind="props.looter"
      class-name="Looter"
    />
  </div>
</template>

<script setup lang="ts">
import type { BattleRoyaleStats } from '~/server/utils/scrape-functions/battle-royale'

const props = defineProps<BattleRoyaleStats & { username: string }>()

</script>

<style scoped>
.profile-grid {
  grid-template-columns: max-content auto;
}
</style>
