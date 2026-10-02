import { useCallback, useEffect, useRef, useState } from 'react'

interface UseRovingFocusReturn {
    /**
     * Props for the list container. Handles ArrowUp/ArrowDown keyboard
     * navigation across all registered items.
     */
    listProps: {
        onKeyDown: (event: React.KeyboardEvent) => void
    }
    /**
     * Register a focusable item with the list. Returns props to spread
     * onto the item's focusable element.
     */
    itemProps: (index: number) => {
        ref: (element: HTMLElement | null) => void
        tabIndex: number
    }
    itemsRef: React.RefObject<HTMLElement[]>
    activeIndex: number
    setActiveIndex: (index: number) => void
    focusFirstItem: () => void
}

/**
 * Roving focus for a list of items. Items register themselves via
 * `itemProps(index)`. ArrowDown on the container focuses the first item,
 * ArrowUp on the first item moves focus to the element passed as
 * `escapeTarget` (e.g. a search input).
 */
export function useRovingFocus(escapeTarget?: React.RefObject<HTMLElement | null>): UseRovingFocusReturn {
    const itemsRef = useRef<HTMLElement[]>([])
    const [activeIndex, setActiveIndex] = useState(-1)

    const setItems = useCallback((index: number) => {
        return (element: HTMLElement | null) => {
            if (element) {
                itemsRef.current[index] = element
            }
        }
    }, [])

    const connectedItems = useCallback(() => itemsRef.current.filter((item) => item?.isConnected), [])

    const focusItem = useCallback(
        (index: number) => {
            const items = connectedItems()
            if (items.length === 0) {
                return
            }

            const clamped = ((index % items.length) + items.length) % items.length
            setActiveIndex(clamped)
            items[clamped]?.focus()
        },
        [connectedItems],
    )

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
                return
            }

            const items = connectedItems()
            if (items.length === 0) {
                return
            }

            const focusedIndex = items.indexOf(document.activeElement as HTMLElement)

            if (event.key === 'ArrowDown') {
                event.preventDefault()

                if (focusedIndex === -1) {
                    focusItem(0)
                    return
                }

                if (focusedIndex < items.length - 1) {
                    focusItem(focusedIndex + 1)
                }
                return
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault()

                if (focusedIndex <= 0) {
                    escapeTarget?.current?.focus()
                    setActiveIndex(-1)
                    return
                }

                focusItem(focusedIndex - 1)
            }
        },
        [connectedItems, escapeTarget, focusItem],
    )

    useEffect(() => {
        return () => {
            itemsRef.current = []
        }
    }, [])

    const itemProps = useCallback(
        (index: number) => ({
            ref: setItems(index),
            tabIndex: activeIndex === index || (activeIndex === -1 && index === 0) ? 0 : -1,
        }),
        [setItems, activeIndex],
    )

    const focusFirstItem = useCallback(() => {
        const items = connectedItems()
        if (items.length > 0) {
            setActiveIndex(0)
            items[0].focus()
        }
    }, [connectedItems])

    return {
        listProps: { onKeyDown: handleKeyDown },
        itemProps,
        itemsRef,
        activeIndex,
        setActiveIndex,
        focusFirstItem,
    }
}