<template>
  <UInput
    v-model="searchedName"
    placeholder="Player Name"
    icon="i-heroicons-magnifying-glass"
    trailing
    size="lg"
    @keyup.enter="navigateToStatsPage"
  />
</template>

<script setup lang="ts">
const searchedName = ref('')

async function navigateToStatsPage() {
  if (searchedName.value) {
    await navigateTo(`/stats/${searchedName.value}`)
    searchedName.value = ''
  }
}
</script>
