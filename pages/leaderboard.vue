<template>
  <UContainer>
    <div
      class="flex items-center py-4 flex-wrap gap-y-4"
      :class="[
        prose,
        'max-w-none',
        'justify-center'
      ]"
    >
      <h1
        :class="[
          'm-0',
          'w-full',
          'text-center'
        ]"
      >
        Leaderboard
      </h1>
      <UTabs
        v-model="selectedTabIdx"
        :items="tabs"
        :ui="{ wrapper: 'space-y-0' }"
        :class="[
          'mr-4 min-w-64',
        ]"
      />
      <div
        id="leaderboard-opts"
        :class="[
          'flex gap-x-4',
        ]"
      />
    </div>
    <NuxtPage />
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()

const tabs = [
  {
    label: 'Battle Royale',
  },
  {
    label: 'Duels',
  },
]

useHead({
  title: 'Leaderboard',
})

const selectedTabIdx = computed({
  get: () => {
    return route.path.includes('royale') ? 0 : 1
  },
  set: async (idx) => {
    await navigateTo(idx === 0 ? '/leaderboard/battle-royale' : '/leaderboard/duels')
  },
})

</script>
