<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: [
          'grid gap-x-12 gap-y-6',
          'grid-cols-2 lg:grid-cols-3'
        ]
      }
    }"
  >
    <div class="grid gap-y-0.5">
      <h3 class="mt-0">
        Casual Stats
      </h3>
      <KitStatsList v-bind="props.casual" />
    </div>
    <div class="grid gap-y-0.5">
      <h3 class="mt-0">
        Custom Stats
      </h3>
      <KitStatsList v-bind="props.custom" />
    </div>
    <div
      :class="[
        'grid gap-y-0.5 gap-x-12',
        'col-span-2 lg:col-span-1',
        'grid-cols-2 lg:grid-cols-1'
      ]"
    >
      <h3
        :class="[
          'mt-0',
          'col-span-2 lg:col-span-1'
        ]"
      >
        Private Stats
      </h3>
      <KitStatsList v-bind="props.private" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { DuelsStats } from '~/server/utils/parsers/duels'

const props = defineProps<DuelsStats>()

</script>
