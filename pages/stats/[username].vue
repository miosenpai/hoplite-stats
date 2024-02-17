<template>
  <UContainer
    v-if="errorCode || initalScrapeLoading || !username"
    :class="[prose, 'flex flex-col justify-center min-h-full']"
  >
    <h1
      v-if="errorCode"
      class="text-center"
    >
      Error: {{ errorCode === 404 ? 'Failed to find player.' : 'Unexpected error occurred.' }}
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
    <div
      class="flex items-center py-4 gap-x-4"
      :class="[prose, 'max-w-none']"
    >
      <img
        :src="`https://minotar.net/helm/${username}`"
        :class="[
          'not-prose h-10',
          'block lg:hidden'
        ]"
      >
      <h1 class="m-0">
        {{ username }}
      </h1>
      <USelectMenu
        v-model="selectedCategory"
        class="not-prose w-40 ml-auto flex-shrink"
        :options="categories"
        size="lg"
        :disabled="pending"
        value-attribute="category"
      />
    </div>
    <UDivider />
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

const initalScrapeLoading = ref(false)

const username = ref<null | string>(null)

// future: looking into client side caching once https://github.com/nuxt/nuxt/issues/24332 is fixed
const { data: profileData, error, pending, refresh } = await useFetch(`/api/stats/${usernameParam}`, {
  query: {
    category: selectedCategory,
  },
  onResponse: ({ response }) => {
    if (response.status === 202)
      initalScrapeLoading.value = true
  },
  lazy: true,
})

const sseError = ref(0)

const errorCode = computed(() => error.value?.statusCode || sseError.value)

watch(profileData, (newProfileData) => {
  if (newProfileData) {
    if ('username' in newProfileData && !username.value) {
      username.value = newProfileData.username
    }

    // client only, SSE should not be subscribed during SSR
    if (import.meta.client && 'sseToken' in newProfileData) {
      const es = new EventSource(`/api/stats-sse?sseToken=${newProfileData.sseToken}`)

      const onComplete = async () => {
        es.close()
        await refresh()
        initalScrapeLoading.value = false
        es.removeEventListener('complete', onComplete)
        es.removeEventListener('fail', onFail)
      }

      const onFail = async () => {
        es.close()
        sseError.value = 500
        initalScrapeLoading.value = false
        es.removeEventListener('complete', onComplete)
        es.removeEventListener('fail', onFail)
      }

      es.addEventListener('complete', onComplete)
      es.addEventListener('fail', onFail)
    }
  }
}, { immediate: true })

watch(selectedCategory, async (newCategory) => {
  await navigateTo({ name: route.name!, query: { category: newCategory !== 'battle-royale' ? newCategory : undefined } })
})

useHead({
  title: username,
})

// defineOgImageScreenshot()

</script>
