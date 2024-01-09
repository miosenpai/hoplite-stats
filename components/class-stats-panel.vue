<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: 'grid grid-cols-2 gap-x-12'
      }
    }"
  >
    <h3 class="mt-0 col-span-2">
      {{ props.className }} Stats
    </h3>
    <div
      :class="[
        'grid',
        'overall-stats-grid',
        'items-center',
        'gap-x-2',
        'gap-y-0.5',
      ]"
    >
      <UIcon name="i-mdi-crown" />
      <span>Wins</span>
      <span class="justify-self-end">{{ props.wins }}</span>
      <UIcon name="i-mdi-alpha-x-circle" />
      <span>Losses</span>
      <span class="justify-self-end">{{ props.losses }}</span>
      <UIcon name="i-mdi-sword" />
      <span>Kills</span>
      <span class="justify-self-end">{{ props.kills }}</span>
    </div>
    <div
      :class="[
        'grid',
        'overall-stats-grid',
        'items-center',
        'gap-x-2',
        'gap-y-0.5',
      ]"
    >
      <UIcon name="i-mdi-skull" />
      <span>Deaths</span>
      <span class="justify-self-end">{{ props.deaths }}</span>
      <UIcon name="i-mdi-sword-cross" />
      <span>Assists</span>
      <span class="justify-self-end">{{ props.assists }}</span>
      <UIcon name="i-mdi-clock-outline" />
      <span>Playtime</span>
      <span class="justify-self-end">00:00:00</span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ClassStats } from '@/server/utils/scrape'

const props = defineProps<ClassStats & { className: string }>()
</script>

<style scoped>
.overall-stats-grid {
  grid-template-columns: min-content auto min-content;
}
</style>
