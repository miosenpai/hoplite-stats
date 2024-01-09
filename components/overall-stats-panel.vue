<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        // base: 'grid grid-cols-2'
        base: 'grid grid-cols-3 gap-x-12'
      }
    }"
  >
    <div
      :class="[
        'grid',
        'overall-stats-grid',
        'items-center',
        'gap-x-2',
        'gap-y-0.5',
      ]"
    >
      <h3 class="col-span-3 mt-0">
        Solo Stats
      </h3>
      <UIcon name="i-mdi-parachute" />
      <span>Games</span>
      <span class="justify-self-end">{{ props.solo.games }}</span>
      <UIcon name="i-mdi-crown" />
      <span>Wins</span>
      <span class="justify-self-end">{{ props.solo.wins }}</span>
      <UIcon name="i-mdi-sword" />
      <span>Kills</span>
      <span class="justify-self-end">{{ props.solo.kills }}</span>
      <UIcon name="i-mdi-sword-cross" />
      <span>Assists</span>
      <span class="justify-self-end">{{ props.solo.assists }}</span>
      <UIcon name="i-mdi-clock-outline" />
      <span>Playtime</span>
      <span>00:00:00</span>
    </div>
    <div
      :class="[
        'grid',
        'overall-stats-grid',
        'items-center',
        'gap-x-2',
        'gap-y-0.5'
      ]"
    >
      <h3 class="col-span-3 mt-0">
        Civilization Stats
      </h3>
      <UIcon name="i-mdi-parachute" />
      <span>Games</span>
      <span class="justify-self-end">{{ props.civ.games }}</span>
      <UIcon name="i-mdi-crown" />
      <span>Wins</span>
      <span class="justify-self-end">{{ props.civ.wins }}</span>
      <UIcon name="i-mdi-sword" />
      <span>Kills</span>
      <span class="justify-self-end">{{ props.civ.kills }}</span>
      <UIcon name="i-mdi-sword-cross" />
      <span>Assists</span>
      <span class="justify-self-end">{{ props.civ.kills }}</span>
      <UIcon name="i-mdi-clock-outline" />
      <span>Playtime</span>
      <span>00:00:00</span>
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
      <h3 class="col-span-3 mt-0">
        Misc Stats
      </h3>
      <UIcon name="i-mdi-anvil" />
      <span>Legendary Crafts</span>
      <span class="justify-self-end">{{ props.solo.kills }}</span>
      <UIcon name="i-mdi-sword" />
      <span>Legendary Kills</span>
      <span class="justify-self-end">{{ props.solo.kills }}</span>
      <UIcon name="i-mdi-clock-outline" />
      <span>Avg Time Alive</span>
      <span>00:00:00</span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// todo: see if there's a way to get Vue to recognize the global definition for this
import type { BrStats } from '@/server/utils/scrape'

const props = defineProps<BrStats>()
</script>

<style scoped>
.overall-stats-grid {
  grid-template-columns: min-content auto min-content;
}
</style>
