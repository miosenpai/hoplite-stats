<template>
  <UInput
    v-model="searchedName"
    placeholder="Player Name"
    size="lg"
    :ui="{
      icon: {
        trailing: {
          pointer: '',
          padding: {
            lg: 'px-1'
          }
        }
      }
    }"
    @keyup.enter="navigateToStatsPage"
  >
    <template #trailing>
      <UButton
        icon="i-heroicons-magnifying-glass"
        variant="ghost"
        color="gray"
        @click="navigateToStatsPage"
      />
    </template>
  </UInput>
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
