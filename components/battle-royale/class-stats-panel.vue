<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: 'grid grid-cols-2 gap-x-12 gap-y-0.5'
      }
    }"
  >
    <h3 class="mt-0 col-span-2">
      {{ props.className }} Stats
    </h3>
    <StatRow
      icon="i-mdi-crown"
      name="Wins"
      :value="props.wins"
    />
    <StatRow
      icon="i-mdi-close-circle"
      name="Losses"
      :value="props.losses"
    />
    <StatRow
      icon="i-mdi-sword"
      name="Kills"
      :value="props.kills"
    />
    <StatRow
      icon="i-mdi-skull"
      name="Deaths"
      :value="props.deaths"
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
  </UCard>
</template>

<script setup lang="ts">
import type { ClassStats } from '@/server/utils/scrape-functions/battle-royale'

const props = defineProps<ClassStats & { className: string }>()
</script>
