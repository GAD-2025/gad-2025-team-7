import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <header className="main-header">
                <ProfileHeader />
            </header>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
