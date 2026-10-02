import { Field } from '@base-ui/react/field'
import { Input as BaseInput } from '@base-ui/react/input'

interface TextFieldProps {
    label: string
    name: string
    error?: string
    required?: boolean
    placeholder?: string
    type?: string
}

export function TextField({ label, name, error, required, placeholder, type = 'text' }: TextFieldProps) {
    return (
        <Field.Root name={name} invalid={!!error} className="grid gap-1.5">
            <Field.Label className="text-xs text-neutral-300">
                {label}
                {required && (
                    <span aria-hidden className="ml-0.5 text-red-400 select-none">
                        *
                    </span>
                )}
            </Field.Label>

            <BaseInput
                type={type}
                name={name}
                required={required}
                placeholder={placeholder}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-500 focus-visible:focus-ring"
            />

            {error && (
                <Field.Error match className="text-xs text-rose-400">
                    {error}
                </Field.Error>
            )}
        </Field.Root>
    )
}