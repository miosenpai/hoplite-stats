<template>
  <UCard
    :class="[prose, 'max-w-none']"
    :ui="{
      body: {
        base: [
          'grid gap-x-12 gap-y-6',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        ]
      }
    }"
  >
    <div class="grid gap-y-0.5">
      <h3 class="mt-0">
        Solo Stats
      </h3>
      <StatRow
        icon="i-mdi-parachute"
        name="Games"
        :value="props.solo.games"
      />
      <StatRow
        icon="i-mdi-crown"
        name="Wins"
        :value="props.solo.wins"
      />
      <StatRow
        icon="i-mdi-sword"
        name="Kills"
        :value="props.solo.kills"
      />
      <StatRow
        icon="i-mdi-sword-cross"
        name="Assists"
        :value="props.solo.assists"
      />
      <StatRow
        icon="i-mdi-clock-outline"
        name="Playtime"
        :value="formatPlaytime(props.solo.playtime)"
      />
    </div>
    <div class="grid gap-y-0.5">
      <h3 class="mt-0">
        Civilization Stats
      </h3>
      <StatRow
        icon="i-mdi-parachute"
        name="Games"
        :value="props.civ.games"
      />
      <StatRow
        icon="i-mdi-crown"
        name="Wins"
        :value="props.civ.wins"
      />
      <StatRow
        icon="i-mdi-sword"
        name="Kills"
        :value="props.civ.kills"
      />
      <StatRow
        icon="i-mdi-sword-cross"
        name="Assists"
        :value="props.civ.assists"
      />
      <StatRow
        icon="i-mdi-clock-outline"
        name="Playtime"
        :value="formatPlaytime(props.civ.playtime)"
      />
    </div>
    <div
      :class="[
        'grid gap-y-0.5 gap-x-12',
        'col-span-1 sm:col-span-2 lg:col-span-1',
        'h-fit',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1'
      ]"
    >
      <h3
        :class="[
          'mt-0',
          'col-span-1 sm:col-span-2 lg:col-span-1'
        ]"
      >
        Misc Stats
      </h3>
      <StatRow
        icon="i-mdi-anvil"
        name="Legendary Crafts"
        :value="props.legendaryCrafts"
      />
      <StatRow
        icon="i-mdi-sword"
        name="Legendary Kills"
        :value="props.legendaryKills"
      />
      <StatRow
        icon="i-mdi-clock-outline"
        name="Avg Time Alive"
        :value="formatPlaytime(props.avgTimeSurvived)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BattleRoyaleStats } from '@/server/utils/parsers/battle-royale'

const props = defineProps<BattleRoyaleStats>()
</script>
