import { createInertiaApp } from '@inertiajs/react'
import type { ComponentType } from 'react'
import { ToastProvider } from './Components/ToastProvider'

void createInertiaApp({
    progress: {
        color: '#fbbf24',
    },
    title: (title) => (title ? `${title} - Letterbook` : 'Letterbook'),
    resolve: (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx', { eager: true })
        const page = pages[`./Pages/${name}.tsx`]

        if (!page) {
            throw new Error(`Page not found: ${name}`)
        }

        return page
    },
    withApp(app) {
        return <ToastProvider>{app}</ToastProvider>
    },
})