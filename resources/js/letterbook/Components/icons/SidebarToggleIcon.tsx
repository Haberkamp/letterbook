import { motion } from 'motion/react'

interface SidebarToggleIconProps {
    collapsed: boolean
}

const FRAME =
    'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z'
// Filled panel: expanded = wide panel on the left, collapsed = thin bar in the middle
const PANEL_EXPANDED = 'M4 4h5v16H4z'
const PANEL_COLLAPSED = 'M10 4h2v16H10z'

const spring = { type: 'spring', bounce: 0.05, duration: 0.4 } as const

export function SidebarToggleIcon({ collapsed }: SidebarToggleIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={FRAME}
            />
            <motion.path
                fill="currentColor"
                d={PANEL_EXPANDED}
                initial={false}
                animate={{ d: collapsed ? PANEL_COLLAPSED : PANEL_EXPANDED }}
                transition={spring}
            />
        </svg>
    )
}