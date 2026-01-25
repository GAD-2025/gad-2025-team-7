import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import MainBackground from './components/MainBackground';
import SlideOutNav from './SlideOutNav'; // Import SlideOutNav
import './MainLayout.css';

const MainLayout = ({ setIsSlideOutNavOpen, isSlideOutNavOpen, setIsTemplateNavOpen, isTemplateNavOpen }) => { // Accept all necessary props
    return (
        <MainBackground>
            <div className="main-layout">
                <header className="main-header">
                    <Link to="/home" className="logo-container">
                        <h1>OneDay</h1>
                        <p>하루를 하나로 관리하다.</p>
                    </Link>
                    <ProfileHeader />
                </header>
                <main className="main-content">
                    {/* collection-trigger and SlideOutNav moved here */}
                    <div id="collection-trigger" onClick={() => setIsSlideOutNavOpen(true)} className="collection-trigger"></div>
                    <SlideOutNav isOpen={isSlideOutNavOpen} onClose={() => setIsSlideOutNavOpen(false)} />
                    <SlideOutNav isOpen={isTemplateNavOpen} onClose={() => setIsTemplateNavOpen(false)} navType="template" />
                    <Outlet context={{ setIsSlideOutNavOpen }} /> {/* Pass setIsSlideOutNavOpen via context */}
                </main>
            </div>
        </MainBackground>
    );
};

export default MainLayout;
