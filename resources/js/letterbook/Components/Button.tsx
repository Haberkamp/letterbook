import { Button as BaseButton } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

export const buttonVariants = cva(
    'inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-normal whitespace-nowrap focus-visible:focus-ring disabled:cursor-default disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-white text-neutral-900 hover:bg-neutral-200 px-3 py-1.5',
                secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 data-popup-open:bg-neutral-700 px-3 py-1.5',
                ghost: 'text-neutral-400 hover:text-white hover:bg-neutral-800 data-popup-open:text-white data-popup-open:bg-neutral-800 px-3 py-1.5',
                icon: 'rounded text-base text-neutral-400 hover:text-white hover:bg-neutral-800 data-popup-open:text-white data-popup-open:bg-neutral-800 relative before:absolute before:-inset-2 before:content-[""]',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    },
)

type ButtonProps = React.ComponentProps<typeof BaseButton> & VariantProps<typeof buttonVariants>

export function Button({ variant, className, ...props }: ButtonProps) {
    return <BaseButton {...props} className={cn(buttonVariants({ variant }), className)} />
}