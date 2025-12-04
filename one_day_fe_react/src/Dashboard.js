import React, { useState } from 'react';
import './Dashboard.css';
import HomeTab from './HomeTab';
import RecordsTab from './RecordsTab';
import HealthcareTab from './HealthcareTab';

const Dashboard = ({
    selectedDate,
    events,
    setEvents,
    todos,
    setTodos,
    diaries,
    setDiaries,
    // New props for event modal from drag selection
    showEventModal,
    setShowEventModal,
    initialEventStartDate,
    initialEventEndDate,
}) => {
    const [activeTab, setActiveTab] = useState('home-tab');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'home-tab':
                return (
                    <HomeTab
                        selectedDate={selectedDate}
                        events={events}
                        setEvents={setEvents}
                        todos={todos}
                        setTodos={setTodos}
                        // Pass new props to HomeTab
                        showScheduleModal={showEventModal} // Use showEventModal from Home.js
                        setShowScheduleModal={setShowEventModal} // Use setShowEventModal from Home.js
                        initialScheduleStartDate={initialEventStartDate}
                        initialScheduleEndDate={initialEventEndDate}
                    />
                );
            case 'records-tab':
                return <RecordsTab diaries={diaries} setDiaries={setDiaries} />;
            case 'healthcare-tab':
                return <HealthcareTab />;
            default:
                return (
                    <HomeTab
                        selectedDate={selectedDate}
                        events={events}
                        setEvents={setEvents}
                        todos={todos}
                        setTodos={setTodos}
                        // Pass new props to HomeTab
                        showScheduleModal={showEventModal} // Use showEventModal from Home.js
                        setShowScheduleModal={setShowEventModal} // Use setShowEventModal from Home.js
                        initialScheduleStartDate={initialEventStartDate}
                        initialScheduleEndDate={initialEventEndDate}
                    />
                );
        }
    };

    return (
        <div className="right-column">
            <div className="dashboard-tabs">
                <button className={`dash-tab-link ${activeTab === 'home-tab' ? 'active' : ''}`} onClick={() => setActiveTab('home-tab')}>홈</button>
                <button className={`dash-tab-link ${activeTab === 'records-tab' ? 'active' : ''}`} onClick={() => setActiveTab('records-tab')}>기록</button>
                <button className={`dash-tab-link ${activeTab === 'healthcare-tab' ? 'active' : ''}`} onClick={() => setActiveTab('healthcare-tab')}>헬스케어</button>
            </div>
            {renderTabContent()}
        </div>
    );
};

export default Dashboard;
