<template>
  <header>
    <UContainer
      :class="[
        'py-4',
        'flex',
        'items-center',
      ]"
    >
      <NuxtLink
        to="/"
        :class="[
          prose,
          'justify-self-start',
          'flex items-center',
          'mr-auto',
        ]"
      >
        <UIcon
          name="i-mdi-chart-areaspline-variant"
          class="text-3xl mr-3"
        />
        <h2
          :class="[
            'm-0',
            'hidden sm:block',
            'pr-3'
          ]"
        >
          Hoplite Stats
        </h2>
      </NuxtLink>
      <PlayerSearch
        v-if="route.path !== '/'"
        :class="[
          'flex-grow',
          'max-w-lg'
        ]"
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
          'ml-auto'
        ]"
        color="gray"
        size="xl"
        variant="ghost"
        to="/leaderboard"
      >
        <span class="hidden sm:inline">Leaderboard</span>
      </UButton>
    </UContainer>
    <UDivider />
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
