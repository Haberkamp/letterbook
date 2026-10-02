import { Toast } from '@base-ui/react/toast'
import { toastManager } from '../Components/ToastProvider'

interface ToastOptions {
    title?: string
    description?: string
    type?: string
    timeout?: number
}

export function useToast() {
    return {
        add(options: ToastOptions) {
            return toastManager.add(options)
        },
        success(options: Omit<ToastOptions, 'type'>) {
            return toastManager.add({ ...options, type: 'success' })
        },
        close(id: string) {
            return toastManager.close(id)
        },
    }
}

export type { Toast }