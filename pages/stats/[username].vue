<template>
  <UContainer
    v-if="error || statsLoading"
    :class="[prose, 'flex flex-col justify-center min-h-full']"
  >
    <h1
      v-if="error"
      class="text-center"
    >
      Error: {{ error.statusCode === 404 ? 'Failed to find player.' : 'Unexpected error occurred.' }}
    </h1>
    <template v-else>
      <h1 class="text-center">
        First time visit, please wait for stats to be collected then refresh.
      </h1>
      <UProgress />
    </template>
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
        value-attribute="category"
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
import type { BattleRoyaleStats } from '@/server/utils/parsers/battle-royale'
import type { DuelsStats } from '@/server/utils/parsers/duels'
// import { useRouteQuery } from '@vueuse/router'

const route = useRoute()
const router = useRouter()

const categoryQuery = route.query.category as string | undefined

const categories = [
  {
    category: 'battle-royale',
    label: 'Battle Royale',
  },
  {
    category: 'duels',
    label: 'Duels',
  },
]

const selectedCategory = ref(categories.map(c => c.category).includes(categoryQuery!) ? categoryQuery! : 'battle-royale')

const username = route.params.username as string

const initalScrapeLoading = ref(false)

// future: looking into client side caching once https://github.com/nuxt/nuxt/issues/24332 is fixed
const { data: statsData, error, pending, refresh } = await useFetch(`/api/stats/${username}`, {
  query: {
    category: selectedCategory,
  },
  onResponse: ({ response }) => {
    if (response.status === 202)
      initalScrapeLoading.value = true
  },
})

const statsLoading = computed(() => initalScrapeLoading.value || pending.value)

onMounted(() => {
  if (statsData.value && 'sseToken' in statsData.value) {
    const es = new EventSource(`/api/stats/${username}/sse?sseToken=${statsData.value.sseToken}`)

    const onComplete = async () => {
      es.close()
      await refresh()
      initalScrapeLoading.value = false
      es.removeEventListener('complete', onComplete)
    }

    es.addEventListener('complete', onComplete)
  }
})

watch(selectedCategory, (newCategory) => {
  router.push({ name: route.name!, query: { category: newCategory !== 'battle-royale' ? newCategory : undefined } })
})

watchEffect(() => console.log(statsLoading.value))

// defineOgImageScreenshot()

</script>
