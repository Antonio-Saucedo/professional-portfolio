import {useRef} from 'react'
import {useFocusTrap} from '../hooks/useFocusTrap'
import './Modal.scss'

interface Props {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({isOpen, onClose, children}: Props) {
    const modalRef = useRef<HTMLDivElement>(null)
    useFocusTrap(isOpen, modalRef)

    if (!isOpen) return null

    return (
        <div className="modal-page" onClick={onClose}>
            <div ref={modalRef} tabIndex={-1} className="modal-container"
                 onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
