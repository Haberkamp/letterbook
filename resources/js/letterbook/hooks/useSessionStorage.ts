import { useCallback, useEffect, useRef, useState } from 'react'

const WRITE_DEBOUNCE_MS = 250

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((current: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = window.sessionStorage.getItem(key)

            return stored === null ? initialValue : (JSON.parse(stored) as T)
        } catch {
            return initialValue
        }
    })

    const latestRef = useRef(value)
    latestRef.current = value

    const set = useCallback((next: T | ((current: T) => T)) => {
        setValue((current) => {
            const resolved = next instanceof Function ? next(current) : next

            latestRef.current = resolved

            return resolved
        })
    }, [])

    // Debounce storage writes so frequent updates (e.g. while resizing) don't block the main thread
    useEffect(() => {
        if (latestRef.current === undefined) {
            return
        }

        const timer = setTimeout(() => {
            try {
                window.sessionStorage.setItem(key, JSON.stringify(latestRef.current))
            } catch {
                // Ignore storage failures (e.g. quota exceeded, private mode)
            }
        }, WRITE_DEBOUNCE_MS)

        return () => clearTimeout(timer)
    }, [key, value])

    return [value, set]
}