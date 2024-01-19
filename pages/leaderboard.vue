<template>
  <UContainer>
    <div
      class="flex items-center py-4 flex-wrap gap-y-4"
      :class="[prose, 'max-w-none']"
    >
      <h1
        :class="[
          'm-0',
          'w-full md:w-auto text-center md:text-left'
        ]"
      >
        Leaderboard
      </h1>
      <div
        :class="[
          'flex ml-auto gap-x-4',
          'w-full md:w-auto',
          'justify-center'
        ]"
      >
        <USelectMenu
          v-model="selectedCategory"
          class="not-prose w-24"
          :options="categories"
          size="lg"
          :disabled="false"
        />
        <USelectMenu
          v-model="selectedMode"
          class="not-prose w-32"
          :options="modes"
          size="lg"
          :disabled="false"
        />
        <USelectMenu
          v-model="selectedTimespan"
          class="not-prose w-36"
          :options="timespans"
          size="lg"
          :disabled="false"
        />
      </div>
    </div>
    <!-- <UDivider /> -->
    <UTable
      :rows="leadeboardData"
    />
  </UContainer>
</template>

<script setup lang="ts">

const route = useRoute()

const categories = [
  'Wins',
  'Kills',
]

const selectedCategory = ref(categories[0])

const modes = [
  'Solo',
  'Civilization',
]

const selectedMode = ref(modes[0])

const timespans = [
  {
    timespan: 'lifetime',
    label: 'Lifetime',
  },
  {
    timespan: 'season',
    label: 'This Season',
  },
  {
    timespan: 'month',
    label: 'Monthly',
  },
  {
    timespan: 'week',
    label: 'Weekly',
  },
  {
    timespan: 'day',
    label: 'Daily',
  },
]

const selectedTimespan = ref(timespans[0])

const leadeboardData = [
  {
    username: 'xShatter',
    kills: 50,
  },
  {
    username: 'Yuishikawa',
    kills: 25,
  },
]

</script>
