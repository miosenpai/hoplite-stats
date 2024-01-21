<template>
  <StatRow
    v-if="props.shownFields.includes('gamesPlayed')"
    icon="i-mdi-parachute"
    name="Games"
    :value="props.gamesPlayed"
  />
  <StatRow
    v-if="props.shownFields.includes('playtime')"
    icon="i-mdi-clock-outline"
    name="Playtime"
    :value="formatPlaytime(props.playtime)"
  />
  <StatRow
    v-if="props.shownFields.includes('wins')"
    icon="i-mdi-crown"
    name="Wins"
    :value="props.wins"
  />
  <StatRow
    v-if="props.shownFields.includes('losses')"
    icon="i-mdi-close-circle"
    name="Losses"
    :value="props.losses"
  />
  <StatRow
    v-if="props.shownFields.includes('kills')"
    icon="i-mdi-sword"
    name="Kills"
    :value="props.kills"
  />
  <StatRow
    v-if="props.shownFields.includes('deaths')"
    icon="i-mdi-skull"
    name="Deaths"
    :value="props.deaths"
  />
  <StatRow
    v-if="props.shownFields.includes('winLossRatio')"
    icon="i-mdi-calculator"
    name="Win/Loss Ratio"
    :value="props.winLossRatio"
  />
  <StatRow
    v-if="props.shownFields.includes('killDeathRatio')"
    icon="i-mdi-calculator"
    name="K/D Ratio"
    :value="props.killDeathRatio"
  />
  <StatRow
    v-if="props.shownFields.includes('currWinstreak')"
    icon="i-mdi-fire"
    name="Current Winstreak"
    :value="props.currWinstreak"
  />
  <StatRow
    v-if="props.shownFields.includes('bestWinstreak')"
    icon="i-mdi-fire"
    name="Best Winstreak"
    :value="props.bestWinstreak"
  />
</template>

<script setup lang="ts">
import type { KitStats } from '~/server/utils/parsers/duels'

type Fields = (keyof KitStats)[]

const props = withDefaults(defineProps<KitStats & { shownFields: Fields }>(), {
  shownFields: () => ['kills', 'deaths', 'killDeathRatio', 'currWinstreak', 'bestWinstreak'],
})

</script>
