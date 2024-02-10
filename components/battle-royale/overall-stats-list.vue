<template>
  <StatRow
    icon="i-mdi-parachute"
    name="Games"
    :value="props.games"
  />
  <StatRow
    icon="i-mdi-crown"
    name="Wins"
    :value="props.wins"
  />
  <StatRow
    icon="i-mdi-sword"
    name="Kills"
    :value="props.kills"
  />
  <StatRow
    icon="i-mdi-sword-cross"
    name="Assists"
    :value="props.assists"
  />
  <StatRow
    icon="i-mdi-clock-outline"
    name="Playtime"
    :value="formatPlaytime(props.playtime)"
  />
  <StatRow
    icon="i-mdi-anvil"
    name="Custom Crafts"
    :value="props.customCrafts"
  />
  <StatRow
    icon="i-mdi-anvil"
    name="Legendary Crafts"
    :value="props.legendaryCrafts"
  />
  <StatRow
    icon="i-mdi-sword"
    name="Legendary Kills"
    :value="props.legendaryKills"
  />
  <StatRow
    icon="i-mdi-clock-outline"
    name="Avg Time Alive"
    :value="formatPlaytime(props.avgTimeSurvived)"
  />
</template>

<script setup lang="ts">
import type { OverallStats } from '@/server/utils/parsers/battle-royale'

const props = defineProps<OverallStats>()

</script>
