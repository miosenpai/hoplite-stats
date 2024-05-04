<template>
  <UContainer>
    <div
      class="flex items-center py-4 gap-x-4"
      :class="[prose, 'max-w-none']"
    >
      <img
        v-if="statsData?.username"
        :src="`https://minotar.net/helm/${statsData?.username}`"
        :class="[
          'not-prose h-10'
        ]"
      >
      <h1 class="m-0">
        {{ statsData?.username || usernameParam }}
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
          v-if="statsData"
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
          v-bind="(statsData as ProfileType<BattleRoyaleStats>).stats"
          class="flex-grow"
        />
        <LadderStatsPanel
          v-else
          v-bind="(statsData as ProfileType<DuelsStats>).stats"
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
          v-bind="(statsData as ProfileType<BattleRoyaleStats>).stats"
        />
        <KitStatsPanels
          v-else
          v-bind="(statsData as ProfileType<DuelsStats>).stats"
        />
      </div>
    </template>
  </UContainer>
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

const { data: statsData, error: statsError, refresh: refreshStats } = await useLazyFetch(() => `/api/stats/${usernameParam}/${selectedCategory.value}`)

const sseError = ref(0)

const errorCode = computed(() => statsError.value?.statusCode || sseError.value)

const noData = computed(() => !statsData.value || 'jobId' in statsData.value || errorCode.value !== 0)

const { open: openSSE, event: sseEvent, status: sseStatus, close: closeSSE } = useEventSource(
  () => `/api/sse?jobId=${(statsData.value as any).jobId}`,
  ['complete', 'fail'],
  { immediate: false },
)
// workaround: sseStatus starts as 'CONNECTING' even if immediate is set to false
sseStatus.value = 'CLOSED'

watch(statsData, (newData) => {
  if (import.meta.client && newData && 'jobId' in newData) {
    // ensure the sseEvent watcher triggers even if prev event was 'complete' as well
    sseEvent.value = null
    openSSE()
  }
}, { immediate: true })

watch(sseEvent, async (newEvent) => {
  if (newEvent) {
    if (newEvent === 'complete') {
      await refreshStats()
    }

    if (newEvent === 'fail') {
      sseError.value = 500
    }

    closeSSE()
  }
})

watch(selectedCategory, async (newCategory) => {
  await navigateTo({ name: route.name!, query: { category: newCategory !== 'battle-royale' ? newCategory : undefined } })
})

useHead({
  title: statsData.value?.username || usernameParam,
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
