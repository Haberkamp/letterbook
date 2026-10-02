import { Toast } from '@base-ui/react/toast'
import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export const toastManager = Toast.createToastManager()

export function ToastProvider({ children }: { children: ReactNode }) {
    return (
        <Toast.Provider toastManager={toastManager}>
            {children}
            <Toast.Portal>
                <Toast.Viewport className="fixed right-4 bottom-4 z-[100] flex w-80 flex-col gap-2 outline-none">
                    <ToastList />
                </Toast.Viewport>
            </Toast.Portal>
        </Toast.Provider>
    )
}

function ToastList() {
    const { toasts } = Toast.useToastManager()

    return toasts.map((toast) => (
        <Toast.Root
            key={toast.id}
            toast={toast}
            render={(props, state) => (
                <motion.div
                    {...(props as HTMLMotionProps<'div'>)}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{
                        opacity: state.transitionStatus === 'ending' ? 0 : 1,
                        y: state.transitionStatus === 'ending' ? 16 : 0,
                    }}
                    transition={{
                        opacity: { duration: 0.2, ease: 'easeOut' },
                        y: { duration: 0.2, ease: 'easeOut' },
                        layout: { type: 'spring', bounce: 0.05, duration: 0.4 },
                    }}
                    className="relative overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 shadow-xl"
                />
            )}
        >
            <span className="absolute inset-0 overflow-hidden rounded-lg" aria-hidden="true">
                <motion.span
                    className="block h-full w-full origin-right bg-white/10"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 5, ease: [0.42, 0, 0.58, 1] }}
                />
            </span>
            <Toast.Content className="relative">
                <div className="grid gap-0.5">
                    <Toast.Title className="text-sm font-medium" />
                    <Toast.Description className="text-xs text-neutral-400" />
                </div>
            </Toast.Content>
        </Toast.Root>
    ))
}