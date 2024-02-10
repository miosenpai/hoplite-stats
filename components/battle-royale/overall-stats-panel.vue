<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: [
          'grid gap-x-12 gap-y-6',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        ]
      }
    }"
  >
    <div class="grid gap-y-0.5">
      <h3 class="mt-0">
        Solo Stats
      </h3>
      <OverallStatsList
        v-bind="props.solo"
      />
    </div>
    <div class="grid gap-y-0.5">
      <h3 class="mt-0">
        Duo Stats
      </h3>
      <OverallStatsList
        v-bind="props.duo"
      />
    </div>
    <div
      :class="[
        'grid gap-y-0.5 gap-x-12',
        'col-span-1 sm:col-span-2 lg:col-span-1',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1'
      ]"
    >
      <h3
        :class="[
          'mt-0',
          'col-span-1 sm:col-span-2 lg:col-span-1'
        ]"
      >
        Civilization Stats
      </h3>
      <OverallStatsList
        v-bind="props.civ"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BattleRoyaleStats } from '@/server/utils/parsers/battle-royale'

const props = defineProps<BattleRoyaleStats>()
</script>
