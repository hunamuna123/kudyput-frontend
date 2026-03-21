import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-bold font-body ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-accent text-primary-dark hover:bg-accent-dark shadow-[0_4px_16px_rgba(164,190,79,0.25)] hover:shadow-[0_6px_24px_rgba(164,190,79,0.35)]',
        destructive:
          'bg-red-500 text-white hover:bg-red-600',
        outline:
          'border-2 border-accent/40 bg-transparent text-primary hover:bg-accent/10 hover:border-accent/80 hover:text-primary',
        secondary:
          'bg-accent/10 text-primary hover:bg-accent/20',
        ghost: 'text-primary hover:bg-accent/10 hover:text-primary',
        link: 'text-accent-dark underline-offset-4 hover:underline',
      },
      size: {
        "default": "h-11 px-5 py-2.5",
        "sm": "h-9 rounded-2xl px-3",
        "lg": "h-12 rounded-3xl px-8",
        "icon": "h-10 w-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
