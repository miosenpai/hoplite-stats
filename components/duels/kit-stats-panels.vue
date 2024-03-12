<template>
  <KitStatsPanel
    class-name="Sword"
    :stats="props.sword"
  />
  <KitStatsPanel
    class-name="Battle Royale"
    :stats="props.battleRoyale"
  />
  <KitStatsPanel
    class-name="Axe"
    :stats="props.axe"
  />
  <KitStatsPanel
    class-name="Crystal"
    :stats="props.crystal"
  />
  <KitStatsPanel
    class-name="Archer"
    :stats="props.archer"
  />
  <KitStatsPanel
    class-name="Potion"
    :stats="props.potion"
  />
  <KitStatsPanel
    class-name="Nether Pot"
    :stats="props.netherPot"
  />
  <KitStatsPanel
    class-name="Bridge"
    :stats="props.bridge"
  />
  <KitStatsPanel
    class-name="Parkour"
    :stats="props.parkour"
  />
</template>

<script setup lang="ts">
import type { DuelsStats } from '~/server/utils/parsers/duels'

const props = defineProps<DuelsStats>()

</script>
