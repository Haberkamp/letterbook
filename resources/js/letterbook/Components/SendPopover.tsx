import { Popover } from '@base-ui/react/popover'
import { Form } from '@inertiajs/react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from './Button'
import { TextField } from './TextField'
import { useToast } from '../hooks/useToast'

interface SendPopoverProps {
    sendUrl: string
    subject: string
    children: React.ReactNode
}

export default function SendPopover({ sendUrl, subject, children }: SendPopoverProps) {
    const [open, setOpen] = useState(false)
    const toast = useToast()

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger
                render={<Button variant="ghost" />}
            >
                {children}
            </Popover.Trigger>

            <AnimatePresence>
                {open && (
                    <Popover.Portal keepMounted>
                        <Popover.Positioner sideOffset={14} className="z-50">
                            <Popover.Popup
                                className="w-80 rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-neutral-100 shadow-xl"
                                render={
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                    />
                                }
                            >
                                <Popover.Title className="text-sm font-medium">Send email</Popover.Title>
                                <Popover.Description className="mt-1 text-xs text-neutral-400">
                                    Send "{subject}" to the specified email address.
                                </Popover.Description>

                                <Form
                                    action={sendUrl}
                                    method="post"
                                    resetOnSuccess
                                    options={{ preserveScroll: true, preserveState: true }}
                                    onSuccess={() => {
                                        setOpen(false)
                                        toast.success({ title: 'Email sent', description: `"${subject}" is on its way.` })
                                    }}
                                    className="mt-4 grid gap-3"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <TextField
                                                label="Email address"
                                                name="email"
                                                type="email"
                                                required
                                                placeholder="jane@example.com"
                                                error={errors.email}
                                            />

                                            <div className="mt-1 flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    focusableWhenDisabled
                                                    className={processing ? 'opacity-50' : undefined}
                                                >
                                                    {processing ? 'Sending...' : 'Send'}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                )}
            </AnimatePresence>
        </Popover.Root>
    )
}