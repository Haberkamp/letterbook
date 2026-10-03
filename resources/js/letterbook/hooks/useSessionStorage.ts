import { useCallback, useState } from 'react'

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((current: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = window.sessionStorage.getItem(key)

            return stored === null ? initialValue : (JSON.parse(stored) as T)
        } catch {
            return initialValue
        }
    })

    const set = useCallback(
        (next: T | ((current: T) => T)) => {
            setValue((current) => {
                const resolved = next instanceof Function ? next(current) : next

                try {
                    window.sessionStorage.setItem(key, JSON.stringify(resolved))
                } catch {
                    // Ignore storage failures (e.g. quota exceeded, private mode)
                }

                return resolved
            })
        },
        [key],
    )

    return [value, set]
}