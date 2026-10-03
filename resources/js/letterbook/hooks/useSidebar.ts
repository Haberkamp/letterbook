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

        if (next === machine.state) {
            return machine
        }

        // An explicit close also clears the remembered "open" state on the other breakpoint
        if (event === 'close') {
            return { state: next, desktopOpen: false, mobileOpen: false }
        }

        return { ...machine, state: next }
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

function initialMachine(): SidebarMachine {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia(`(min-width: ${SIDEBAR_BREAKPOINT}px)`).matches

    return { state: isDesktop ? 'desktopOpen' : 'mobileClosed', desktopOpen: isDesktop, mobileOpen: false }
}

export function useSidebar() {
    const [machine, send] = useReducer(reducer, undefined, initialMachine)

    useEffect(() => {
        const query = window.matchMedia(`(min-width: ${SIDEBAR_BREAKPOINT}px)`)
        const onChange = (event: MediaQueryListEvent) => send(event.matches ? 'enterDesktop' : 'enterMobile')

        query.addEventListener('change', onChange)

        return () => query.removeEventListener('change', onChange)
    }, [])

    const isMobile = machine.state === 'mobileOpen' || machine.state === 'mobileClosed'
    const isOpen = machine.state === 'desktopOpen' || machine.state === 'mobileOpen'

    return { isOpen, isMobile, send }
}