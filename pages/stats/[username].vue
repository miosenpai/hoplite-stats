<template>
  <UContainer v-if="statsData">
    <div
      class="flex justify-between items-center py-4"
      :class="[prose, 'max-w-none']"
    >
      <h1 class="m-0">
        {{ username }}
      </h1>
      <USelectMenu
        v-model="selectedGameMode"
        class="not-prose w-1/6"
        :options="gameModes"
        size="lg"
      />
    </div>
    <UDivider />
    <div
      :class="[
        // 'flex py-6 gap-6 items-center'
        'grid',
        'profile-grid',
        'gap-6',
        'py-6'
      ]"
    >
      <img
        :src="`https://minotar.net/avatar/${username}`"
        class="min-h-full aspect-square"
      >
      <OverallStatsPanel v-bind="statsData" />
    </div>
    <div
      :class="[
        'grid grid-cols-2',
        'gap-6'
      ]"
    >
      <ClassStatsPanel
        v-bind="statsData.miner"
        class-name="Miner"
      />
      <ClassStatsPanel
        v-bind="statsData.warrior"
        class-name="Warrior"
      />
      <ClassStatsPanel
        v-bind="statsData.trapper"
        class-name="Trapper"
      />
      <ClassStatsPanel
        v-bind="statsData.archer"
        class-name="Archer"
      />
      <ClassStatsPanel
        v-bind="statsData.looter"
        class-name="Looter"
      />
    </div>
  </UContainer>
  <UContainer
    v-else
    :class="[prose, 'flex flex-col justify-center min-h-full']"
  >
    <h1 class="text-center">
      Error
    </h1>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()

const username = route.params.username

const { data: statsData, error } = await useFetch(`/api/stats/${username}`)

const gameModes = ['Battle Royale', 'Duels']

const selectedGameMode = ref(gameModes[0])

</script>

<style scoped>
.profile-grid {
  grid-template-columns: max-content auto;
}
</style>