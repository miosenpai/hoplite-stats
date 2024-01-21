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
    <KitStatsList v-bind="props" />
  </UCard>
</template>

<script setup lang="ts">
import type { KitStats } from '~/server/utils/parsers/duels'

const props = defineProps<KitStats & { className: string }>()
</script>
