import { useCallback, useRef, useState } from 'react'

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

function clampWidth(width: number) {
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))
}

export default function EmailPreview({ html, text, mode }: EmailPreviewProps) {
    const [width, setWidth] = useState(DEFAULT_WIDTH)
    const [draggingEdge, setDraggingEdge] = useState<-1 | 1 | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const dragStateRef = useRef<{
        startX: number
        startWidth: number
        edge: -1 | 1
        pointerId: number
        moved: boolean
    } | null>(null)

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
        [applyWidth],
    )

    const startDrag = (edge: -1 | 1) => (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) {
            return
        }

        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        dragStateRef.current = {
            startX: event.clientX,
            startWidth: width,
            edge,
            pointerId: event.pointerId,
            moved: false,
        }
        setDraggingEdge(edge)
    }

    const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const dragState = dragStateRef.current
        if (!dragState || event.pointerId !== dragState.pointerId) {
            return
        }

        const delta = (event.clientX - dragState.startX) * dragState.edge * 2
        if (Math.abs(event.clientX - dragState.startX) >= 4) {
            dragState.moved = true
        }
        applyWidth(clampWidth(dragState.startWidth + delta))
    }

    const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
        const dragState = dragStateRef.current
        dragStateRef.current = null
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        setDraggingEdge(null)

        if (dragState) {
            // A plain click (no drag) resets to the default width.
            if (!dragState.moved) {
                setWidth(DEFAULT_WIDTH)
                applyWidth(DEFAULT_WIDTH)
            } else if (iframeRef.current) {
                setWidth(clampWidth(parseFloat(iframeRef.current.style.width)))
            }
        }
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

    const focusClass = 'group-focus-visible/bar:outline-2 group-focus-visible/bar:outline-neutral-100 group-focus-visible/bar:outline-offset-2'

    const barColor = (edge: -1 | 1) => {
        if (draggingEdge === edge) {
            return 'bg-neutral-600 dark:bg-neutral-500'
        }

        return (edge === -1 ? width <= MIN_WIDTH : width >= MAX_WIDTH)
            ? 'bg-neutral-300 dark:bg-neutral-800'
            : 'bg-neutral-400 dark:bg-neutral-700 hover:bg-neutral-600 dark:hover:bg-neutral-500'
    }

    return (
        <div className="group relative flex justify-center p-6">
            <div className="relative">
                <button
                    type="button"
                    aria-label="Decrease preview width"
                    aria-valuenow={width}
                    aria-valuemin={MIN_WIDTH}
                    aria-valuemax={MAX_WIDTH}
                    aria-orientation="horizontal"
                    onPointerDown={startDrag(-1)}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onKeyDown={barKeyDown(-1)}
                    className={`${barClass} -left-1 -ml-6 px-2.5`}
                >
                    <span className={`mx-auto block h-full w-1 rounded-full transition-colors ${focusClass} ${barColor(-1)}`} />
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
                    aria-valuemax={MAX_WIDTH}
                    aria-orientation="horizontal"
                    onPointerDown={startDrag(1)}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onKeyDown={barKeyDown(1)}
                    className={`${barClass} -right-1 -mr-6 px-2.5`}
                >
                    <span className={`mx-auto block h-full w-1 rounded-full transition-colors ${focusClass} ${barColor(1)}`} />
                </button>
            </div>
        </div>
    )
}