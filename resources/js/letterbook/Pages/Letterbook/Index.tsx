import { Accordion } from '@base-ui/react/accordion'
import { Tabs } from '@base-ui/react/tabs'
import { Input as BaseInput } from '@base-ui/react/input'
import { Head, Link } from '@inertiajs/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { formatForDisplay } from '@tanstack/hotkeys'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import type { FuzzyResult, HighlightRanges } from '@nozbe/microfuzz'
import { useRovingFocus } from '../../hooks/useRovingFocus'
import EmailPreview from '../../Components/EmailPreview'
import { Button } from '../../Components/Button'
import { StoryHighlight } from '../../Components/StoryHighlight'
import { ClearIcon } from '../../Components/icons/ClearIcon'
import { FolderClosedIcon, FolderOpenIcon } from '../../Components/icons/FolderIcons'
import { SubItemIcon } from '../../Components/icons/SubItemIcon'
import { SelectedIcon } from '../../Components/icons/SelectedIcon'
import SendPopover from '../../Components/SendPopover'
import { SidebarToggleIcon } from '../../Components/icons/SidebarToggleIcon'
import { useQueryParameter } from '../../hooks/useQueryParameter'

export interface StoryEntry {
    slug: string
    title: string
    group: string | null
    description: string | null
    depth: number
}

interface EmailPayload {
    html: string
    text: string
    subject: string
}

interface PageProps {
    stories: StoryEntry[]
    slug: string | null
    email: EmailPayload
}

export default function Index({ stories, slug, email }: PageProps) {
    const [queryParam, setQuery] = useQueryParameter('q')
    const query = queryParam ?? ''
    const [mode, setMode] = useQueryParameter('mode')
    const searchInputRef = useRef<HTMLInputElement>(null)
    const view = mode === 'text' ? 'text' : 'html'

    useHotkey('Mod+K', (event) => {
        event.preventDefault()
        searchInputRef.current?.focus()
    })

    useHotkey('T', () => {
        setMode(view === 'text' ? null : 'text')
    })

    const rovingFocus = useRovingFocus(searchInputRef)
    let rovingIndex = -1
    const nextRovingIndex = () => ++rovingIndex

    const getText = useCallback((story: StoryEntry) => [story.group, story.title], [])
    const mapResultItem = useCallback(
        ({ item, matches }: FuzzyResult<StoryEntry>) => ({
            story: item,
            // matches[0] is for the group text, matches[1] for the title
            highlightRanges: item.group ? (matches[1] ?? null) : (matches[0] ?? null),
        }),
        [],
    )

    const filtered = useFuzzySearchList<StoryEntry, { story: StoryEntry; highlightRanges: HighlightRanges | null }>({
        list: stories,
        queryText: query,
        getText,
        mapResultItem,
    })

    const highlightedStories = filtered.map((result) => result.story)
    const highlightRangesBySlug = new Map(filtered.map((result) => [result.story.slug, result.highlightRanges]))

    const parents = stories.filter((story) => story.depth === 0)

    // Pull in the parents of matched variants so they are still shown while searching
    const matchedVariantParents = query
        ? [
            ...new Set(
                highlightedStories
                    .filter((story) => story.depth > 0)
                    .map((variant) => parents.find((parent) => variant.slug.startsWith(`${parent.slug}-`)))
                    .filter((parent): parent is StoryEntry => parent !== undefined)
                    .map((parent) => parent.slug),
            ),
        ]
            .map((parentSlug) => parents.find((parent) => parent.slug === parentSlug)!)
            .filter((parent) => !highlightedStories.some((story) => story.slug === parent.slug))
        : []

    const visibleStories = query ? [...highlightedStories, ...matchedVariantParents] : stories

    const groups = visibleStories.reduce<Record<string, StoryEntry[]>>((acc, story) => {
        const key = story.group ?? ''
        acc[key] = acc[key] ?? []
        acc[key].push(story)
        return acc
    }, {})
    const defaultOpenParents = parents
        .filter((parent) =>
            stories.some((story) => story.depth > 0 && story.slug.startsWith(`${parent.slug}-`) && story.slug === slug),
        )
        .map((parent) => parent.slug)

    // While searching, expand parents whose variants match so they are visible
    const searchOpenParents = matchedVariantParents.map((parent) => parent.slug)

    const openItems = [...new Set([...defaultOpenParents, ...searchOpenParents])]

    const [sidebarOpen, setSidebarOpen] = useState(true)

    const storyUrl = (storySlug: string) => {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (mode) params.set('mode', mode)
        const search = params.toString()
        return `/letterbook/${storySlug}${search ? `?${search}` : ''}`
    }

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100">
            <Head title={email.subject || 'Letterbook'} />

            <AnimatePresence initial={false}>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0 }}
                        animate={{ width: 288 }}
                        exit={{ width: 0 }}
                        transition={{ type: 'spring', bounce: 0.05, duration: 0.4 }}
                        className="relative shrink-0 overflow-hidden"
                    >
                        <div className="flex h-full w-72 flex-col">
                            <div className="h-12 border-b border-neutral-800">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="flex h-12 items-center gap-2 px-4"
                                >
                                    <span className="text-lg font-medium">Letterbook</span>
                                </motion.div>
                            </div>

                            <div className="border-b border-neutral-800">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="p-3"
                                >
                                    <div className="relative">
                                    <BaseInput
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search stories..."
                                        value={query}
                                        onValueChange={(value) => {
                                            setQuery(value)
                                            rovingFocus.setActiveIndex(-1)
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'ArrowDown') {
                                                event.preventDefault()
                                                rovingFocus.focusFirstItem()
                                            }
                                        }}
                                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 py-1.5 pr-16 pl-3 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500 focus-visible:focus-ring"
                                    />
                                    {!query && (
                                        <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] text-neutral-600">
                                            <kbd className="font-mono leading-none">
                                                {formatForDisplay('Mod+K', { separatorToken: '' })}
                                            </kbd>
                                        </span>
                                    )}
                                    {query && (
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                setQuery('')

                                                // Only move focus back to the search for keyboard activation
                                                if (event.detail === 0) {
                                                    searchInputRef.current?.focus()
                                                }
                                            }}
                                            aria-label="Clear search"
                                            className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center rounded text-sm text-neutral-500 hover:text-neutral-300 focus-visible:focus-ring before:absolute before:-inset-1.5 before:content-['']"
                                        >
                                            <ClearIcon />
                                        </button>
                                    )}
                                    </div>
                                </motion.div>
                            </div>

                            <div className="min-h-0 flex-1" {...rovingFocus.listProps}>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="h-full"
                                >
                                <Accordion.Root
                                    multiple
                                    key={query}
                                    defaultValue={openItems}
                                    className="h-full overflow-y-auto p-3"
                                >
                                {Object.entries(groups).map(([group, groupStories]) => (
                                    <div key={group} className="mb-4">
                                        {group && (
                                            <h2 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                {group}
                                            </h2>
                                        )}
                                        <ul className="space-y-0.5">
                                            {groupStories.filter((story) => story.depth === 0).map((story) => {
                                                const variants = groupStories.filter((child) => child.depth > 0 && child.slug.startsWith(`${story.slug}-`))
                                                const hasVariants = stories.some((child) => child.depth > 0 && child.slug.startsWith(`${story.slug}-`))

                                                return (
                                                    <li key={story.slug}>
                                                        <Accordion.Item value={story.slug}>
                                                            <Accordion.Header className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-0.5">
                                                                {hasVariants ? (
                                                                    <>
                                                                        <Accordion.Trigger
                                                                            {...rovingFocus.itemProps(nextRovingIndex())}
                                                                            className={`group/trigger flex min-w-0 flex-1 cursor-pointer items-center rounded-md py-1.5 text-left text-sm focus-visible:focus-ring ${
                                                                                story.slug === slug
                                                                                    ? 'text-white'
                                                                                    : 'text-neutral-300 hover:text-white'
                                                                            }`}
                                                                        >
                                                                            <FolderClosedIcon className="mr-1.5 shrink-0 text-neutral-500 group-data-panel-open/trigger:hidden" />
                                                                            <FolderOpenIcon className="mr-1.5 hidden shrink-0 text-neutral-500 group-data-panel-open/trigger:block" />
                                                                            <span className="truncate">
                                                                            {query && highlightRangesBySlug.get(story.slug) ? (
                                                                                <StoryHighlight text={story.title} ranges={highlightRangesBySlug.get(story.slug)!} />
                                                                            ) : (
                                                                                story.title
                                                                            )}
                                                                        </span>
                                                                        </Accordion.Trigger>
                                                                    </>
                                                                ) : (
                                                                    <Link
                                                                        {...rovingFocus.itemProps(nextRovingIndex())}
                                                                        href={storyUrl(story.slug)}
                                                                        preserveState
                                                                        prefetch
                                                                        className={`flex min-w-0 flex-1 items-center rounded-md py-1.5 text-sm focus-visible:focus-ring ${
                                                                            story.slug === slug
                                                                                ? 'text-white'
                                                                                : 'text-neutral-300 hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {story.slug === slug ? (
                                                                            <SelectedIcon className="mr-1.5 shrink-0 text-white" />
                                                                        ) : (
                                                                            <SubItemIcon className="mr-1.5 shrink-0 text-neutral-500" />
                                                                        )}
                                                                        <span className="truncate">
                                                                            {query && highlightRangesBySlug.get(story.slug) ? (
                                                                                <StoryHighlight text={story.title} ranges={highlightRangesBySlug.get(story.slug)!} />
                                                                            ) : (
                                                                                story.title
                                                                            )}
                                                                        </span>
                                                                    </Link>
                                                                )}
                                                            </Accordion.Header>

                                                            {variants.length > 0 && (
                                                                <Accordion.Panel className="mt-0.5 space-y-0.5">
                                                                    {variants.map((variant) => (
                                                                        <Link
                                                                            {...rovingFocus.itemProps(nextRovingIndex())}
                                                                            key={variant.slug}
                                                                            href={storyUrl(variant.slug)}
                                                                            preserveState
                                                                            prefetch
                                                                            style={{ paddingLeft: `${0.5 + variant.depth * 0.75}rem` }}
                                                                            className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm focus-visible:focus-ring ${
                                                                                variant.slug === slug
                                                                                    ? 'bg-neutral-800 text-white'
                                                                                    : 'text-neutral-400 hover:bg-neutral-900'
                                                                            }`}
                                                                        >
                                                                            {variant.slug === slug ? (
                                                                                <SelectedIcon className="shrink-0 text-white" />
                                                                            ) : (
                                                                                <SubItemIcon className="shrink-0 text-neutral-500" />
                                                                            )}
                                                                            <span className="truncate">
                                                                                {query && highlightRangesBySlug.get(variant.slug) ? (
                                                                                    <StoryHighlight text={variant.title} ranges={highlightRangesBySlug.get(variant.slug)!} />
                                                                                ) : (
                                                                                    variant.title
                                                                                )}
                                                                            </span>
                                                                        </Link>
                                                                    ))}
                                                                </Accordion.Panel>
                                                            )}
                                                        </Accordion.Item>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                ))}

                                {visibleStories.length === 0 && (
                                    <p className="px-2 py-4 text-sm text-neutral-500">
                                        {query
                                            ? 'No stories match your search.'
                                            : 'No email stories found. Define them in your stories file.'}
                                    </p>
                                )}
                            </Accordion.Root>
                                </motion.div>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.1, delay: 0.05 } }}
                            exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.15 } }}
                            className="absolute inset-y-0 right-0 w-px bg-neutral-800"
                        />
                    </motion.aside>
                )}
            </AnimatePresence>

            <Tabs.Root
                value={view}
                onValueChange={(value) => setMode(value === 'text' ? 'text' : null)}
                className="flex min-w-0 flex-1 flex-col"
            >
                <header className="flex h-12 items-center justify-between gap-6 border-b border-neutral-800 px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        >
                            <SidebarToggleIcon collapsed={!sidebarOpen} />
                        </Button>
                        <h1 className="truncate text-sm font-medium text-neutral-200 select-text">{email.subject}</h1>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        <Tabs.List className="relative isolate flex rounded-md text-xs">
                            <Tabs.Indicator className="absolute z-0 rounded-md bg-neutral-800 transition-all duration-200 ease-out [left:var(--active-tab-left)] [width:var(--active-tab-width)] [height:var(--active-tab-height)]" />
                            <Tabs.Tab
                                value="html"
                                className="relative flex cursor-pointer items-center rounded-md px-3 py-1.5 tracking-wide text-neutral-400 hover:text-neutral-200 data-active:text-white focus-visible:focus-ring"
                            >
                                HTML
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="text"
                                className="relative flex cursor-pointer items-center rounded-md px-3 py-1.5 tracking-wide text-neutral-400 hover:text-neutral-200 data-active:text-white focus-visible:focus-ring"
                            >
                                Text
                            </Tabs.Tab>
                        </Tabs.List>
                        {slug && <SendPopover slug={slug} subject={email.subject}>Send</SendPopover>}
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-950">
                    <Tabs.Panel value="html" keepMounted className="contents">
                        <EmailPreview html={email.html} mode="html" />
                    </Tabs.Panel>
                    <Tabs.Panel value="text" keepMounted className="contents">
                        <EmailPreview text={email.text} mode="text" />
                    </Tabs.Panel>
                </div>
            </Tabs.Root>
        </div>
    )
}