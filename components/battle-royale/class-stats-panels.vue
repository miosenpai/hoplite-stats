<template>
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
</template>

<script setup lang="ts">
import type { BattleRoyaleStats } from '@/server/utils/parsers/battle-royale'

const props = defineProps<BattleRoyaleStats>()
</script>
