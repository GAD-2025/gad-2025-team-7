import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import './SlideOutNav.css';

const SlideOutNav = ({ isOpen, onClose }) => {
    return (
        <>
            <div className={`slide-out-nav-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
            <div className={`slide-out-nav-container ${isOpen ? 'show' : ''}`}>
                <div className="slide-out-nav-header">
                    <h2>모아보기</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="slide-out-nav-content">
                    <nav>
                        <ul>
                            <li>
                                <Link to="/diary-collection" onClick={onClose}>다이어리 모아보기</Link>
                            </li>
                            <li>
                                <Link to="/records-collection" onClick={onClose}>기록 모아보기</Link>
                            </li>
                            <li>
                                <Link to="/healthcare-collection" onClick={onClose}>헬스케어 모아보기</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default SlideOutNav;
