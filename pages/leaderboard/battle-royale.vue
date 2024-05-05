<template>
  <UTable
    :rows="leaderboardData && !('jobId' in leaderboardData) ? leaderboardData[selectedCategory as 'kills' | 'wins'] : []"
    :loading="pending"
    :empty-state="{
      icon: 'i-heroicons-circle-stack-20-solid',
      label: 'First time visit, please wait for data to be collected then refresh.' ,
    }"
    :columns="columns"
    :ui="{
      th: {
        size: 'text-base'
      },
      td: {
        size: 'text-base'
      }
    }"
  >
    <template #username-data="{ row }">
      <NuxtLink
        :to="`/stats/${row.username}`"
        :prefetch="false"
      >
        <img
          :src="`https://minotar.net/helm/${row.username}`"
          class="h-4 inline mb-0.5 mr-2"
        >
        <span>{{ row.username }}</span>
      </NuxtLink>
    </template>
  </UTable>
  <!-- eslint-disable-next-line vue/no-multiple-template-root -->
  <ClientOnly>
    <Teleport to="#leaderboard-opts">
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
        class="not-prose w-24"
        :options="modes"
        size="lg"
        :disabled="false"
        value-attribute="mode"
      />
      <USelectMenu
        v-model="selectedTimespan"
        class="not-prose w-28"
        :options="timespans"
        size="lg"
        :disabled="false"
        value-attribute="timespan"
      />
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">

const route = useRoute()

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
    label: 'Civ',
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
    label: 'Season',
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

const { data: leaderboardData, pending } = await useFetch('/api/leaderboard/battle-royale', {
  query: {
    gamemode: selectedMode,
    timespan: selectedTimespan,
  },
  lazy: true,
})

watch([selectedCategory, selectedMode, selectedTimespan], async ([newCategory, newMode, newTimespan]) => {
  await navigateTo({ name: route.name!, query: {
    ...route.query,
    category: newCategory !== 'wins' ? newCategory : undefined,
    mode: newMode !== 'solo' ? newMode : undefined,
    timespan: newTimespan !== 'lifetime' ? newTimespan : undefined,
  } })
})
</script>
