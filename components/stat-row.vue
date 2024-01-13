<template>
  <p class="flex items-center gap-2 my-0">
    <UIcon :name="props.icon" />
    <span class="flex-grow">{{ props.name }}</span>
    <span>{{ props.value }}</span>
  </p>
</template>

<script setup lang="ts" generic="T">
const props = defineProps<{
  icon: string
  name: string
  value: T
}>()
</script>
