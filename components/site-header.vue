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
            name="i-heroicons-chart-bar-solid"
            class="align-[-0.125em]"
          />
          Hoplite Stats
        </h2>
      </NuxtLink>
      <PlayerSearch class="col-span-2" />
      <UButton
        icon="i-mdi-github"
        color="white"
        size="xl"
        class="justify-self-end"
        variant="ghost"
      />
    </UContainer>
    <UDivider />
  </header>
</template>
