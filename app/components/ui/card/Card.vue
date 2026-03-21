<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-3xl bg-white/35 border border-accent/40 text-primary shadow-sm font-body',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
