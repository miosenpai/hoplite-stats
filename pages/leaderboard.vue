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
          value-attribute="category"
        />
        <USelectMenu
          v-model="selectedMode"
          class="not-prose w-32"
          :options="modes"
          size="lg"
          :disabled="false"
          value-attribute="mode"
        />
        <USelectMenu
          v-model="selectedTimespan"
          class="not-prose w-36"
          :options="timespans"
          size="lg"
          :disabled="false"
          value-attribute="timespan"
        />
      </div>
    </div>
    <!-- <UDivider /> -->
    <UTable
      :rows="leaderboardData ? leaderboardData[selectedCategory as 'kills' | 'wins'] : []"
      :loading="pending"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'First time visit, please wait for data to be collected then refresh.' ,
      }"
      :columns="columns"
    />
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const categoryQuery = route.query.category as string | undefined
const modeQuery = route.query.mode as string | undefined
const timespanQuery = route.query.timespan as string | undefined

const categories = [
  {
    category: 'wins',
    label: 'Wins',
  },
  {
    category: 'kills',
    label: 'Kills',
  },
]

const selectedCategory = ref(categories.map(c => c.category).includes(categoryQuery!) ? categoryQuery! : 'wins')

const columns = computed(() => {
  return [
    {
      key: 'username',
      label: 'Player',
    },
    {
      key: 'value',
      label: selectedCategory.value === 'wins' ? 'Wins' : 'Kills',
    },
  ]
})

const modes = [
  {
    mode: 'solo',
    label: 'Solo',
  },
  {
    mode: 'civ',
    label: 'Civilization',
  },
]

const selectedMode = ref(modes.map(m => m.mode).includes(modeQuery!) ? modeQuery! : 'solo')

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
    timespan: 'monthly',
    label: 'Monthly',
  },
  {
    timespan: 'weekly',
    label: 'Weekly',
  },
  {
    timespan: 'daily',
    label: 'Daily',
  },
]

const selectedTimespan = ref(timespans.map(t => t.timespan).includes(timespanQuery!) ? timespanQuery! : 'lifetime')

const { data: leaderboardData, pending } = await useFetch('/api/leaderboard', {
  query: {
    gamemode: selectedMode,
    timespan: selectedTimespan,
  },
})

watch(selectedCategory, () => {
  if (selectedCategory.value !== 'wins')
    router.push({ name: route.name!, query: { category: selectedCategory.value } })
})

watch(selectedMode, () => {
  if (selectedMode.value !== 'solo')
    router.push({ name: route.name!, query: { mode: selectedMode.value } })
})

watch(selectedTimespan, () => {
  if (selectedTimespan.value !== 'solo')
    router.push({ name: route.name!, query: { mode: selectedTimespan.value } })
})

</script>
