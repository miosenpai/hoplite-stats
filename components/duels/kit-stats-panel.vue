<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: [
          'grid gap-x-12 gap-y-0.5',
          'grid-cols-1 lg:grid-cols-2'
        ]
      }
    }"
  >
    <h3 class="mt-0 lg:col-span-2">
      {{ props.className }} Stats
    </h3>
    <KitStatsList v-bind="props.stats" />
  </UCard>
</template>

<script setup lang="ts">
import type { KitStats } from '~/server/utils/parsers/duels'

const props = defineProps<{ className: string, stats: KitStats }>()
</script>
