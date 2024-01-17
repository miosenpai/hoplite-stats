<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: 'grid grid-cols-3 gap-x-12'
      }
    }"
  >
    <div class="flex flex-col gap-0.5">
      <h3 class="mt-0">
        Casual Stats
      </h3>
      <KitStatsList v-bind="props.casual" />
    </div>
    <div class="flex flex-col gap-0.5">
      <h3 class="mt-0">
        Custom Stats
      </h3>
      <KitStatsList v-bind="props.custom" />
    </div>
    <div class="flex flex-col gap-0.5">
      <h3 class="mt-0">
        Private Stats
      </h3>
      <KitStatsList v-bind="props.private" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DuelsStats } from '~/server/utils/scrape-functions/duels'

const props = defineProps<DuelsStats>()

</script>
