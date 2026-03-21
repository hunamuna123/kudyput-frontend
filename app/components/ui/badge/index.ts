import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Badge } from "./Badge.vue"

export const badgeVariants = cva(
  'inline-flex gap-1 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold font-body transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-accent/15 text-accent-dark',
        secondary:
          'border-transparent bg-primary/8 text-primary',
        destructive:
          'border-transparent bg-red-500/15 text-red-700',
        outline: 'border-primary/15 text-primary',
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
