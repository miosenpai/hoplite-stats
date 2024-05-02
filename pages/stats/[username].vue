<template>
  <UContainer>
    <div
      class="flex items-center py-4 gap-x-4"
      :class="[prose, 'max-w-none']"
    >
      <img
        v-if="selectedFetcher.data.value?.username"
        :src="`https://minotar.net/helm/${selectedFetcher.data.value?.username}`"
        :class="[
          'not-prose h-10'
        ]"
      >
      <h1 class="m-0">
        {{ selectedFetcher.data.value?.username || usernameParam }}
      </h1>
      <USelectMenu
        v-model="selectedCategory"
        :ui="{
          wrapper: 'not-prose w-40 ml-auto flex-shrink'
        }"
        :options="categories"
        size="lg"
        :disabled="noData"
        value-attribute="category"
      />
    </div>
    <UDivider />
    <div v-if="noData">
      <h1
        v-if="errorCode"
        class="text-center"
      >
        {{ errorCodeToMsg(errorCode) }}
      </h1>
      <template v-else>
        <h1
          v-if="sseStatus !== 'CLOSED'"
          class="text-center"
        >
          First time visit, loading may take longer than usual.
        </h1>
        <UProgress />
      </template>
    </div>
    <template v-else>
      <div
        :class="[
          'flex',
          'py-6',
          'gap-x-6'
        ]"
      >
        <OverallStatsPanel
          v-if="selectedCategory === 'battle-royale'"
          v-bind="(selectedFetcher.data.value as ProfileType<BattleRoyaleStats>).stats"
          class="flex-grow"
        />
        <LadderStatsPanel
          v-else
          v-bind="(selectedFetcher.data.value as ProfileType<DuelsStats>).stats"
          class="flex-grow"
        />
      </div>
      <div
        :class="[
          'grid',
          'grid-cols-1 sm:grid-cols-2',
          'gap-6 pb-6'
        ]"
      >
        <ClassStatsPanels
          v-if="selectedCategory === 'battle-royale'"
          v-bind="(selectedFetcher.data.value as ProfileType<BattleRoyaleStats>).stats"
        />
        <KitStatsPanels
          v-else
          v-bind="(selectedFetcher.data.value as ProfileType<DuelsStats>).stats"
        />
      </div>
    </template>
  </UContainer>

  <!-- <UContainer
    v-if="errorCode || initalScrapeLoading || !username"
    :class="[prose, 'flex flex-col justify-center min-h-full']"
  >
    <h1
      v-if="errorCode"
      class="text-center"
    >
      Error: {{ errorCodeToMsg(errorCode) }}
    </h1>
    <template v-else>
      <h1
        v-if="initalScrapeLoading"
        class="text-center"
      >
        First time visit, loading may take longer than usual.
      </h1>
      <UProgress />
    </template>
  </UContainer>
  <UContainer v-else>
    <template v-if="!pending">
      <div
        :class="[
          'flex',
          'py-6',
          'gap-x-6'
        ]"
      >
        <img
          :src="`https://minotar.net/helm/${username}`"
          :class="[
            'flex-shrink-0',
            'hidden lg:block',
            'self-start',
            'w-56'
          ]"
        >
        <OverallStatsPanel
          v-if="selectedCategory === 'battle-royale'"
          v-bind="(profileData as ProfileType<BattleRoyaleStats>).stats"
          class="flex-grow"
        />
        <LadderStatsPanel
          v-else
          v-bind="(profileData as ProfileType<DuelsStats>).stats"
          class="flex-grow"
        />
      </div>
      <div
        :class="[
          'grid',
          'grid-cols-1 sm:grid-cols-2',
          'gap-6 pb-6'
        ]"
      >
        <ClassStatsPanels
          v-if="selectedCategory === 'battle-royale'"
          v-bind="(profileData as ProfileType<BattleRoyaleStats>).stats"
        />
        <KitStatsPanels
          v-else
          v-bind="(profileData as ProfileType<DuelsStats>).stats"
        />
      </div>
    </template>
  </UContainer> -->
</template>

<script setup lang="ts">
import type { BattleRoyaleStats } from '@/server/utils/parsers/battle-royale'
import type { DuelsStats } from '@/server/utils/parsers/duels'

type ProfileType<T> = { username: string, stats: T }

const route = useRoute()

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

const usernameParam = route.params.username as string

// future: looking into client side caching once https://github.com/nuxt/nuxt/issues/24332 is fixed
/* const { data: profileData, error, pending, refresh } = await useFetch(`/api/stats/${usernameParam}`, {
    query: {
      category: selectedCategory,
    },
    onResponse: ({ response }) => {
      if (response.status === 202)
        initalScrapeLoading.value = true
    },
    lazy: true,
  }) */

const battleRoyaleFetcher = await useLazyFetch(`/api/stats/${usernameParam}/battle-royale`, {
  immediate: false,
})

const duelsFetcher = await useLazyFetch(`/api/stats/${usernameParam}/duels`, {
  immediate: false,
})

const selectedFetcher = computed(() => selectedCategory.value === 'battle-royale' ? battleRoyaleFetcher : duelsFetcher)

await callOnce(() => selectedFetcher.value.refresh())

watch(selectedFetcher, async (newFetcher) => {
  await newFetcher.refresh()
})

const sseError = ref(0)

const errorCode = computed(() => selectedFetcher.value.error.value?.statusCode || sseError.value)

const noData = computed(() => {
  return !selectedFetcher.value.data.value || 'jobId' in selectedFetcher.value.data.value || sseStatus.value !== 'CLOSED' || errorCode.value !== 0
})

const { open: openSSE, event: sseEvent, status: sseStatus, close: closeSSE } = useEventSource(
  () => `/api/sse?jobId=${(selectedFetcher.value.data.value as any).jobId}`,
  ['complete', 'fail'],
  { immediate: false },
)
// workaround: sseStatus starts as 'CONNECTING' even if immediate is set to false
sseStatus.value = 'CLOSED'

watch(() => selectedFetcher.value.data.value, (newData) => {
  if (import.meta.client && newData && 'jobId' in newData) {
    openSSE()
  }
}, { immediate: true })

watch(sseEvent, async (newEvent) => {
  if (newEvent === 'complete') {
    await selectedFetcher.value.execute()
    closeSSE()
  }

  if (newEvent === 'fail')
    sseError.value = 500
})

watch(selectedCategory, async (newCategory) => {
  await navigateTo({ name: route.name!, query: { category: newCategory !== 'battle-royale' ? newCategory : undefined } })
})

useHead({
  title: selectedFetcher.value.data.value?.username || usernameParam,
})

function errorCodeToMsg(code: number) {
  switch (code) {
    case 404:
      return 'Failed to find player.'
    case 403:
      return 'Player\'s profile is private.'
    default:
      return 'Unexpected error occurred.'
  }
}

// defineOgImageScreenshot()

</script>
