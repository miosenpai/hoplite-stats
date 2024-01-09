<template>
  <footer>
    <UDivider />
    <UContainer
      :class="[
        'py-4',
        'flex justify-between items-center'
      ]"
    >
      <p>
        Not affiliated with
        <ULink
          to="https://hoplite.gg/"
          inactive-class="text-primary"
        >
          Hoplite.gg
        </ULink>
      </p>
      <p>
        Made with ❤️ by
        <ULink
          to="https://github.com/miosenpai"
          inactive-class="text-primary"
        >
          miosenpai
        </ULink>
      </p>
    </UContainer>
  </footer>
</template>
