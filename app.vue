<template>
  <SiteHeader />
  <main>
    <NuxtPage />
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">

useHead({
  titleTemplate: (partialTitle) => {
    return partialTitle ? `${partialTitle} - Hoplite Stats` : 'Hoplite Stats'
  },
})

</script>

<style>
#__nuxt {
  @apply grid min-h-screen;
  grid-template-rows: min-content auto min-content;
}

@media (prefers-color-scheme: dark) {
  #__nuxt {
    background-color: color-mix(in srgb, rgb(var(--color-gray-900)), #000 25%);
  }
}
</style>
