import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Toggle } from "./Toggle.vue"

export const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-bold font-body text-primary-light hover:bg-accent/10 hover:text-primary disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-primary-dark data-[state=on]:shadow-[0_2px_8px_rgba(164,190,79,0.2)] [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ring-offset-white transition-all duration-200 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          'border border-accent/40 bg-transparent hover:bg-accent/10 hover:text-primary',
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-8 px-2 min-w-8",
        lg: "h-11 px-4 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ToggleVariants = VariantProps<typeof toggleVariants>
