import { useCallback, useEffect, useRef, useState } from 'react'

import { useSessionStorage } from '../hooks/useSessionStorage'

interface EmailPreviewProps {
    html?: string
    text?: string
    mode: 'html' | 'text'
}

const MIN_WIDTH = 320
const MAX_WIDTH = 1200
const DEFAULT_WIDTH = 672
const STEP = 32
const SHIFT_MULTIPLIER = 4
const RESERVED_SPACE = 120
const OVERSHOOT_MAX = 11.02

// Overshoot / follow-through: let the handle travel a little past the limit with diminishing resistance
function overshoot(raw: number, min: number, max: number) {
    if (raw < min) {
        return min - easeOut(Math.min((min - raw) / (max - min), 1)) * OVERSHOOT_MAX
    }

    if (raw > max) {
        return max + easeOut(Math.min((raw - max) / (max - min), 1)) * OVERSHOOT_MAX
    }

    return raw
}

function easeOut(value: number) {
    // Quadratic ease-out over the normalized range [0, 1]
    return 1 - (1 - value) ** 2
}

export default function EmailPreview({ html, text, mode }: EmailPreviewProps) {
    const [width, setWidth] = useSessionStorage('letterbook.emailPreview.width', DEFAULT_WIDTH)
    const [draggingEdge, setDraggingEdge] = useState<-1 | 1 | null>(null)
    const [handleOffset, setHandleOffset] = useState(0)
    const { containerRef, maxWidth, clampWidth } = useContainerMaxWidth(MIN_WIDTH)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const dragStateRef = useRef<{
        startX: number
        startWidth: number
        edge: -1 | 1
        pointerId: number
    } | null>(null)

    useEffect(() => {
        setWidth((current) => clampWidth(current))
    }, [clampWidth, setWidth])

    const applyWidth = useCallback((nextWidth: number) => {
        if (iframeRef.current) {
            iframeRef.current.style.width = `${nextWidth}px`
        }
    }, [])

    const changeWidth = useCallback(
        (delta: number) => {
            setWidth((current) => {
                const next = clampWidth(current + delta)
                applyWidth(next)
                return next
            })
        },
        [applyWidth, clampWidth],
    )

    const startDrag = (edge: -1 | 1) => (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) {
            return
        }

        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        dragStateRef.current = { startX: event.clientX, startWidth: width, edge, pointerId: event.pointerId }
        setDraggingEdge(edge)
    }

    const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const dragState = dragStateRef.current
        if (!dragState || event.pointerId !== dragState.pointerId) {
            return
        }

        const raw = dragState.startWidth + (event.clientX - dragState.startX) * dragState.edge * 2
        const clamped = clampWidth(raw)
        const visual = overshoot(raw, MIN_WIDTH, maxWidth)

        applyWidth(clamped)
        setHandleOffset(Math.round((visual - clamped) * dragState.edge))
    }

    const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
        const dragState = dragStateRef.current
        dragStateRef.current = null
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        setDraggingEdge(null)
        setHandleOffset(0)

        if (dragState && iframeRef.current) {
            setWidth(clampWidth(parseFloat(iframeRef.current.style.width)))
        }
    }

    const resetWidth = () => {
        setWidth(clampWidth(DEFAULT_WIDTH))
        applyWidth(clampWidth(DEFAULT_WIDTH))
    }
    if (mode === 'text') {
        return (
            <pre className="p-6 text-sm whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 [&_*]:select-text select-text">
                {text}
            </pre>
        )
    }

    const barKeyDown = (edge: -1 | 1) => (event: React.KeyboardEvent) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return
        }

        event.preventDefault()
        const direction = event.key === 'ArrowLeft' ? -1 : 1
        const delta = direction * edge * STEP * (event.shiftKey ? SHIFT_MULTIPLIER : 1)
        changeWidth(delta)
    }

    const barClass =
        'group/bar absolute top-1/2 z-10 h-40 -translate-y-1/2 cursor-ew-resize rounded-full py-6 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100'

    const focusClass = 'group-focus-visible/bar:focus-ring'

    const barColor = () =>
        'bg-neutral-400 dark:bg-neutral-700 group-hover/bar:bg-neutral-600 dark:group-hover/bar:bg-neutral-500'

    return (
        <div ref={containerRef} className="group relative flex justify-center p-6">
            <div className="relative">
                <button
                    type="button"
                    aria-label="Decrease preview width"
                    aria-valuenow={width}
                    aria-valuemin={MIN_WIDTH}
                    aria-valuemax={maxWidth}
                    aria-orientation="horizontal"
                    onPointerDown={startDrag(-1)}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onDoubleClick={resetWidth}
                    onKeyDown={barKeyDown(-1)}
                    style={draggingEdge === -1 ? { translate: `${handleOffset}px -50%` } : undefined}
                    className={`${barClass} -left-1 -ml-6 px-2.5 ${draggingEdge === -1 ? 'transition-[translate] duration-200 ease-out' : ''}`}
                >
                    <span className={`mx-auto block h-full w-1 rounded-full transition-colors ${focusClass} ${barColor()}`} />
                </button>

                <iframe
                    ref={iframeRef}
                    title="Email preview"
                    srcDoc={html}
                    sandbox="allow-same-origin"
                    style={{ width }}
                    className="block h-full min-h-[60vh] rounded-lg border border-neutral-300 bg-clip-padding bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
                />

                <button
                    type="button"
                    aria-label="Increase preview width"
                    aria-valuenow={width}
                    aria-valuemin={MIN_WIDTH}
                    aria-valuemax={maxWidth}
                    aria-orientation="horizontal"
                    onPointerDown={startDrag(1)}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onDoubleClick={resetWidth}
                    onKeyDown={barKeyDown(1)}
                    style={draggingEdge === 1 ? { translate: `${handleOffset}px -50%` } : undefined}
                    className={`${barClass} -right-1 -mr-6 px-2.5 ${draggingEdge === 1 ? 'transition-[translate] duration-200 ease-out' : ''}`}
                >
                    <span className={`mx-auto block h-full w-1 rounded-full transition-colors ${focusClass} ${barColor()}`} />
                </button>
            </div>
        </div>
    )
}

function useContainerMaxWidth(minWidth: number) {
    const [maxWidth, setMaxWidth] = useState(MAX_WIDTH)
    const containerRef = useRef<HTMLDivElement>(null)

    const clampWidth = useCallback(
        (value: number) => Math.min(maxWidth, Math.max(minWidth, value)),
        [maxWidth, minWidth],
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container || typeof ResizeObserver === 'undefined') {
            return
        }

        let frame: number | null = null

        const updateMaxWidth = () => {
            frame = requestAnimationFrame(() => {
                frame = null
                setMaxWidth(Math.max(minWidth, container.clientWidth - RESERVED_SPACE))
            })
        }

        const observer = new ResizeObserver(updateMaxWidth)

        observer.observe(container)
        setMaxWidth(Math.max(minWidth, container.clientWidth - RESERVED_SPACE))

        return () => {
            if (frame !== null) {
                cancelAnimationFrame(frame)
            }

            observer.disconnect()
        }
    }, [minWidth])

    return { containerRef, maxWidth, clampWidth }
}