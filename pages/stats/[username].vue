<template>
  <UContainer
    v-if="error || initalScrapeLoading || !username"
    :class="[prose, 'flex flex-col justify-center min-h-full']"
  >
    <h1
      v-if="error"
      class="text-center"
    >
      Error: {{ error.statusCode === 404 ? 'Failed to find player.' : 'Unexpected error occurred.' }}
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
        class="not-prose min-w-40 ml-auto"
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
            'w-[242px] flex-shrink-0',
            'hidden lg:block'
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
          'grid-cols-2',
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
      <!--<BattleRoyaleStats
        v-if="selectedCategory === 'battle-royale'"
        v-bind="(profileData as ProfileType<BattleRoyaleStats>).stats"
        :username="username"
      />
      <DuelsStats
        v-else-if="selectedCategory === 'duels'"
        v-bind="(profileData as ProfileType<DuelsStats>).stats"
        :username="username"
      />-->
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import type { BattleRoyaleStats } from '@/server/utils/parsers/battle-royale'
import type { DuelsStats } from '@/server/utils/parsers/duels'
// import { useRouteQuery } from '@vueuse/router'

type ProfileType<T> = { username: string, stats: T }

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

watch(profileData, (newProfileData) => {
  if (newProfileData && 'username' in newProfileData && !username.value) {
    username.value = newProfileData.username
  }
}, { immediate: true })

onMounted(() => {
  console.log('onMounted fired')
  if (profileData.value && 'sseToken' in profileData.value) {
    const es = new EventSource(`/api/stats/${usernameParam}/sse?sseToken=${profileData.value.sseToken}`)

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

// defineOgImageScreenshot()

</script>
