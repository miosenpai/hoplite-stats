<template>
  <header>
    <UContainer
      :class="[
        'grid',
        'grid-cols-4',
        'items-center',
        'py-4'
      ]"
    >
      <NuxtLink
        to="/"
        :class="[prose, 'justify-self-start']"
      >
        <h2>
          <UIcon
            name="i-mdi-chart-line"
            class="align-[-0.175em]"
          />
          Hoplite Stats
        </h2>
      </NuxtLink>
      <PlayerSearch
        v-if="route.path !== '/'"
        class="col-span-2"
      />
      <!--<UButton
        icon="i-mdi-github"
        color="white"
        size="xl"
        :class="[
          'justify-self-end',
          'col-start-4'
        ]"
        variant="ghost"
      />-->
      <UButton
        icon="i-mdi-list-box"
        :class="[
          'justify-self-end',
          'col-start-4'
        ]"
        color="gray"
        size="lg"
        variant="ghost"
      >
        Leaderboard
      </UButton>
    </UContainer>
    <UDivider />
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
