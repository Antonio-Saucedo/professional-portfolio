import {useState} from 'react';
import Modal from '../../components/Modal';
import counterIconUrl from './icons/counter-icon.svg';
import closeButtonIconUrl from '../global-icons/close-button-icon.svg';
import './counter.scss';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function Counter({isOpen, onClose}: Props) {
    const [counter, setCounter] = useState(0);

    const decrement = () => setCounter(prev => prev - 1);
    const increment = () => setCounter(prev => prev + 1);
    const reset = () => setCounter(0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="react-counter">
            <div className="modal-header">
                <span className="header-left-section">
                    <img src={counterIconUrl} alt="Counter icon"/>
                </span>
                <span className="header-center-section">
                    <span className="header-title">React Counter</span><br/>
                    <span className="header-subtitle">Powered by React · useState</span>
                </span>
                <span className="header-right-section">
                    <button className="close-button" onClick={onClose}>
                        <img src={closeButtonIconUrl} alt="Close button icon"/>
                    </button>
                    <span className="badge">
                        <span className="badge-dot"></span>React
                    </span>
                </span>
            </div>
            <div className="modal-body">
                <div className="counter-value">{counter}</div>
                <div className="buttons-container">
                    <button className="counter-subtract-button" onClick={decrement}>-</button>
                    <button className="counter-add-button" onClick={increment}>+</button>
                </div>
            </div>
            <div className="modal-footer">
                <button className="counter-reset-button" onClick={reset}>Reset</button>
            </div>
        </Modal>
    )
}
