import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ show, onClose, children, contentClassName }) => {
    if (!show) {
        return null;
    }

    const modalContentClasses = `modal-content ${contentClassName || ''}`;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className={modalContentClasses} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
