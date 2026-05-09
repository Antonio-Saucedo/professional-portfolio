import {useEffect} from 'react'

export function useFocusTrap(isOpen: boolean, ref: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (!isOpen) return

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ')

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            const modal = ref.current
            if (!modal) return

            const focusable = Array.from(
                modal.querySelectorAll<HTMLElement>(focusableSelectors)
            ).filter(el => !el.closest('[disabled]'))

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, ref])
}
