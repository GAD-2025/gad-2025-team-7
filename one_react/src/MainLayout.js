import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import MainBackground from './components/MainBackground';
import './MainLayout.css';

const MainLayout = ({ setIsSlideOutNavOpen }) => { // Accept setIsSlideOutNavOpen as prop
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
                    <Outlet context={{ setIsSlideOutNavOpen }} /> {/* Pass setIsSlideOutNavOpen via context */}
                </main>
            </div>
        </MainBackground>
    );
};

export default MainLayout;
