<template>
  <SiteHeader />
  <main>
    <NuxtPage />
  </main>
  <SiteFooter />
</template>

<style>
#__nuxt {
  @apply grid min-h-screen;
  grid-template-rows: min-content auto min-content;
}
</style>
