<template>
  <UContainer
    v-if="error || !statsData"
    :class="[prose, 'flex flex-col justify-center min-h-full']"
  >
    <h1
      v-if="error"
      class="text-center"
    >
      Error: {{ error.statusCode === 404 ? 'Failed to find player.' : 'Unexpected error occurred.' }}
    </h1>
    <h1
      v-else
      class="text-center"
    >
      First time visit, please wait for stats to be collected then refresh.
    </h1>
  </UContainer>
  <UContainer v-else>
    <div
      class="flex justify-between items-center py-4"
      :class="[prose, 'max-w-none']"
    >
      <h1 class="m-0">
        {{ username }}
      </h1>
      <USelectMenu
        v-model="selectedCategory"
        class="not-prose w-1/6"
        :options="categories"
        size="lg"
        :disabled="pending"
      />
    </div>
    <UDivider />
    <template v-if="!pending">
      <BattleRoyaleStats
        v-if="!route.query.category"
        v-bind="(statsData as BattleRoyaleStats)"
        :username="username"
      />
      <DuelsStats
        v-else-if="route.query.category === 'duels'"
        v-bind="(statsData as DuelsStats)"
        :username="username"
      />
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import type { BattleRoyaleStats } from '@/server/utils/scrape-functions/battle-royale'
import type { DuelsStats } from '@/server/utils/scrape-functions/duels'
// import { useRouteQuery } from '@vueuse/router'

const route = useRoute()
const router = useRouter()

// const queryCategory = useRouteQuery<string | undefined>('category', undefined)

const queryCategory = route.query.category as string | undefined

const categories = [
  {
    category: '',
    label: 'Battle Royale',
  },
  {
    category: 'duels',
    label: 'Duels',
  },
]

const selectedCategory = ref(
  categories.find(c => c.category === queryCategory)
    ? categories.find(c => c.category === queryCategory)!
    : categories[0],
)

const username = route.params.username as string

const selectedCategoryQuery = computed(() => selectedCategory.value.category || undefined)

// future: looking into client side caching once https://github.com/nuxt/nuxt/issues/24332 is fixed
const { data: statsData, error, pending } = await useFetch(`/api/stats/${username}`, {
  query: {
    category: selectedCategoryQuery,
  },
})

watch(selectedCategoryQuery, (newSelected) => {
  console.log(newSelected)
  if (newSelected)
    router.push({ name: route.name!, query: { category: newSelected } })
  else
    router.push({ name: route.name!, query: { category: undefined } })
})

/* watchEffect(() => console.log(error)) */
/* watchEffect(() => queryCategory.value) */

// defineOgImageScreenshot()

</script>
