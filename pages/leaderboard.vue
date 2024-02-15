<template>
  <UContainer>
    <div
      class="grid header-grid py-4"
      :class="[prose, 'max-w-none']"
    >
      <UTabs
        v-model="selectedTabIdx"
        :items="tabs"
        :ui="{ wrapper: 'space-y-0' }"
        class="max-w-72"
      />
      <h1
        :class="[
          'm-0',
        ]"
      >
        Leaderboard
      </h1>
      <div
        id="leaderboard-opts"
        :class="[
          'flex gap-x-4',
          'w-full md:w-auto',
          'justify-end'
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

<style scoped>
.header-grid {
  grid-template-columns: 1fr auto 1fr;
}
</style>
