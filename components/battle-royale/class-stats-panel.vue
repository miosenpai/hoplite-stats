<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: [
          'grid grid-cols-1 gap-x-12 gap-y-0.5',
          'lg:grid-cols-2',
        ]
      }
    }"
  >
    <h3 class="mt-0 lg:col-span-2">
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
import type { ClassStats } from '@/server/utils/parsers/battle-royale'

const props = defineProps<ClassStats & { className: string }>()
</script>
