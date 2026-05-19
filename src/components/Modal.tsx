import {useRef} from 'react';
import {useFocusTrap} from '../hooks/useFocusTrap';
import './Modal.scss';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export default function Modal({isOpen, onClose, children, className}: Props) {
    const modalRef = useRef<HTMLDivElement>(null)
    useFocusTrap(isOpen, modalRef)

    if (!isOpen) return null

    return (
        <div className="modal-page" onClick={onClose}>
            <div ref={modalRef} tabIndex={-1} className={`modal-container${className ? ` ${className}` : ''}`}
                 onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
