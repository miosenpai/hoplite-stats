<template>
  <UTable
    :rows="leaderboardData && !('jobId' in leaderboardData) ? leaderboardData[selectedCategory as 'wins' | 'streaks'] : []"
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
        :options="categories"
        class="not-prose w-28"
        size="lg"
        value-attribute="category"
      />
      <USelectMenu
        v-model="selectedKit"
        :options="kits"
        class="not-prose w-32"
        size="lg"
        value-attribute="kit"
      />
      <USelectMenu
        v-model="selectedTeamSize"
        :options="teamSizes"
        value-attribute="size"
        class="not-prose w-24"
        size="lg"
      />
      <USelectMenu
        v-model="selectedTimespan"
        :options="timespans"
        value-attribute="timespan"
        class="not-prose w-28"
        size="lg"
      />
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">

const route = useRoute()

const categoryQuery = route.query.category as string | undefined
const kitQuery = route.query.kit as string | undefined
const teamSizeQuery = route.query.teamSize as string | undefined
const timespanQuery = route.query.timespan as string | undefined

const categories = [
  {
    category: 'wins',
    label: 'Wins',
  },
  {
    category: 'streaks',
    label: 'Streaks',
  },
]

const selectedCategory = ref(categories.map(c => c.category).includes(categoryQuery!) ? categoryQuery! : 'wins')

const columns = computed(() => {
  const valueLabel = selectedCategory.value === 'wins' ? 'Wins' : 'Win Streaks'

  return [
    {
      key: 'username',
      label: 'Player',
    },
    {
      key: 'value',
      label: valueLabel,
    },
  ]
})

const kits = [
  {
    kit: 'overall',
    label: 'Overall',
  },
  {
    kit: 'sword',
    label: 'Sword',
  },
  {
    kit: 'battle-royale',
    label: 'BR',
  },
  {
    kit: 'axe',
    label: 'Axe',
  },
  {
    kit: 'crystal',
    label: 'Crystal',
  },
  {
    kit: 'archer',
    label: 'Archer',
  },
  {
    kit: 'potion',
    label: 'Potion',
  },
  {
    kit: 'nether-pot',
    label: 'NetherPot',
  },
  {
    kit: 'bridge',
    label: 'Bridge',
  },
  {
    kit: 'parkour',
    label: 'Parkour',
  },
  {
    kit: 'custom',
    label: 'Custom',
  },
]

const selectedKit = ref(kits.map(k => k.kit).includes(kitQuery!) ? kitQuery! : 'overall')

const teamSizes = [
  {
    size: 1,
    label: '1v1',
  },
  {
    size: 2,
    label: '2v2',
  },
]

const selectedTeamSize = ref(teamSizes.map(t => t.size).includes(parseInt(teamSizeQuery!)) ? parseInt(teamSizeQuery!) : 1)

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

const { data: leaderboardData, pending } = await useFetch('/api/leaderboard/duels', {
  query: {
    kit: selectedKit,
    timeSize: selectedTeamSize,
    timespan: selectedTimespan,
  },
  lazy: true,
})

watch([selectedKit, selectedTeamSize, selectedTimespan], async ([newKit, newTeamSize, newTimespan]) => {
  await navigateTo({
    name: route.name!,
    query: {
      ...route.query,
      kit: newKit !== 'overall' ? newKit : undefined,
      teamSize: newTeamSize !== 1 ? newTeamSize : undefined,
      timespan: newTimespan !== 'lifetime' ? newTimespan : undefined,
    },
  })
})

</script>
