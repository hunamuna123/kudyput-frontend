<script lang="ts" setup>
import type { CalendarCellTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CalendarCellTrigger, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'

const props = defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarCellTrigger
    :class="cn(
      buttonVariants({ variant: 'ghost' }),
      'h-9 w-9 p-0 font-normal rounded-xl',
      '[&[data-today]:not([data-selected])]:bg-accent/15 [&[data-today]:not([data-selected])]:text-accent-dark',
      // Selected
      'data-[selected]:bg-accent data-[selected]:text-primary-dark data-[selected]:opacity-100 data-[selected]:hover:bg-accent-dark data-[selected]:hover:text-primary-dark data-[selected]:focus:bg-accent data-[selected]:focus:text-primary-dark data-[selected]:shadow-[0_2px_8px_rgba(164,190,79,0.25)]',
      // Disabled
      'data-[disabled]:text-primary-light data-[disabled]:opacity-50',
      // Unavailable
      'data-[unavailable]:text-primary-light data-[unavailable]:line-through',
      // Outside months
      'data-[outside-view]:text-primary-light data-[outside-view]:opacity-50 [&[data-outside-view][data-selected]]:bg-accent/20 [&[data-outside-view][data-selected]]:text-primary-light [&[data-outside-view][data-selected]]:opacity-30',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarCellTrigger>
</template>
