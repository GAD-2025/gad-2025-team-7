import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import MainBackground from './components/MainBackground';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <MainBackground>
            <div className="main-layout">
                <header className="main-header">
                    <ProfileHeader />
                </header>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </MainBackground>
    );
};

export default MainLayout;
