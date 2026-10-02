import { usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export function useQueryParameter(key: string): [string | null, (value: string | null) => void] {
    const url = usePage().url
    const current = new URLSearchParams(url.split('?')[1] ?? '').get(key)

    const [value, setValue] = useState(current)

    // Sync with Inertia navigations (e.g. story links carrying the param)
    useEffect(() => {
        setValue(current)
    }, [url])

    function set(next: string | null) {
        const search = new URLSearchParams(window.location.search)

        if (next === null || next === '') {
            search.delete(key)
        } else {
            search.set(key, next)
        }

        const query = search.toString()

        window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''))
        setValue(next === null || next === '' ? null : next)
    }

    return [value, set]
}
