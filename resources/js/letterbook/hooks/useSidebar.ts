import { useEffect, useReducer } from 'react'

export const SIDEBAR_BREAKPOINT = 1024

type SidebarState = 'desktopOpen' | 'desktopClosed' | 'mobileOpen' | 'mobileClosed'

export type SidebarEvent = 'open' | 'close' | 'enterDesktop' | 'enterMobile'

interface SidebarMachine {
    state: SidebarState
    desktopOpen: boolean
    mobileOpen: boolean
}

const transitions: Record<SidebarState, Partial<Record<SidebarEvent, SidebarState>>> = {
    desktopOpen: { open: 'desktopOpen', close: 'desktopClosed' },
    desktopClosed: { open: 'desktopOpen', close: 'desktopClosed' },
    mobileOpen: { open: 'mobileOpen', close: 'mobileClosed' },
    mobileClosed: { open: 'mobileOpen', close: 'mobileClosed' },
}

function reducer(machine: SidebarMachine, event: SidebarEvent): SidebarMachine {
    if (event === 'open' || event === 'close') {
        const next = transitions[machine.state][event] ?? machine.state

        return next === machine.state ? machine : { ...machine, state: next }
    }

    if (event === 'enterDesktop') {
        if (machine.state === 'desktopOpen' || machine.state === 'desktopClosed') {
            return machine
        }

        // An open mobile sidebar opens the desktop version; a closed one restores the remembered desktop state
        if (machine.state === 'mobileOpen') {
            return { ...machine, state: 'desktopOpen', mobileOpen: true }
        }

        return { ...machine, state: machine.desktopOpen ? 'desktopOpen' : 'desktopClosed', mobileOpen: false }
    }

    if (machine.state === 'mobileOpen' || machine.state === 'mobileClosed') {
        return machine
    }

    // An open desktop sidebar collapses on mobile but remembers it was open; a closed one restores the remembered mobile state
    return {
        ...machine,
        state: machine.mobileOpen ? 'mobileOpen' : 'mobileClosed',
        desktopOpen: machine.state === 'desktopOpen',
    }
}

export function useSidebar() {
    const [machine, send] = useReducer(reducer, { state: 'desktopOpen', desktopOpen: true, mobileOpen: false })

    useEffect(() => {
        const query = window.matchMedia(`(min-width: ${SIDEBAR_BREAKPOINT}px)`)
        const onChange = (event: MediaQueryListEvent) => send(event.matches ? 'enterDesktop' : 'enterMobile')

        send(query.matches ? 'enterDesktop' : 'enterMobile')
        query.addEventListener('change', onChange)

        return () => query.removeEventListener('change', onChange)
    }, [])

    const isMobile = machine.state === 'mobileOpen' || machine.state === 'mobileClosed'
    const isOpen = machine.state === 'desktopOpen' || machine.state === 'mobileOpen'

    return { isOpen, isMobile, send }
}