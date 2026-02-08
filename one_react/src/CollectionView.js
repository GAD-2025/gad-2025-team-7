import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HealthcareCollection from './HealthcareCollection';
import StopwatchCollection from './StopwatchCollection';
import DiaryCollection from './DiaryCollection';
import MiniCalendar from './MiniCalendar'; // Import MiniCalendar
import './CollectionView.css'; // New CSS file for CollectionView

const CollectionButton = ({ label, isActive, onClick }) => {
    const buttonStyle = {
        width: '114.28px',
        height: '39px',
        borderRadius: '26.76px',
        fontSize: '16.33px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        border: '1px solid #E1E7EF',
        backgroundColor: isActive ? '#FF7581' : '#F9FAFD',
        color: isActive ? '#FCFDFD' : '#3F3F3F',
    };

    return (
        <div style={buttonStyle} onClick={onClick}>
            {label}
        </div>
    );
};

const CollectionView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedCollection, setSelectedCollection] = useState('healthcare'); // Default to healthcare
    const [currentMonthYear, setCurrentMonthYear] = useState(new Date()); // State for MiniCalendar's displayed month/year


    useEffect(() => {
        // Set selected collection based on URL path
        if (location.pathname.includes('/healthcare-collection')) {
            setSelectedCollection('healthcare');
        } else if (location.pathname.includes('/stopwatch-collection')) {
            setSelectedCollection('stopwatch');
        } else if (location.pathname.includes('/diary-collection')) {
            setSelectedCollection('diary');
        }
    }, [location.pathname]);

    const handleCollectionChange = (collectionType) => {
        setSelectedCollection(collectionType);
        // Also update the URL to reflect the selected collection
        navigate(`/${collectionType}-collection`);
    };

    return (
        <div className="collection-view-container">
            <div className="collection-buttons-wrapper">
                <CollectionButton
                    label="헬스케어"
                    isActive={selectedCollection === 'healthcare'}
                    onClick={() => handleCollectionChange('healthcare')}
                />
                <CollectionButton
                    label="스톱워치"
                    isActive={selectedCollection === 'stopwatch'}
                    onClick={() => handleCollectionChange('stopwatch')}
                />
                <CollectionButton
                    label="다이어리"
                    isActive={selectedCollection === 'diary'}
                    onClick={() => handleCollectionChange('diary')}
                />
            </div>

            <div className="collection-content-wrapper">
                <div className="collection-left-box">
                    {selectedCollection === 'healthcare' && <HealthcareCollection />}
                    {selectedCollection === 'stopwatch' && <StopwatchCollection displayMode="daily" />}
                    {selectedCollection === 'diary' && <DiaryCollection />}
                </div>
                <div className="collection-right-box">
                    <div className="collection-right-box-top">
                        <MiniCalendar
                            selectedDates={[]} // No dates selected for this general calendar view
                            onDateChange={() => {}} // No-op function for date change
                            currentMonthYear={currentMonthYear}
                            setCurrentMonthYear={setCurrentMonthYear}
                        />
                    </div>
                    <div className="collection-right-box-bottom">
                        {/* Content for the bottom right box */}
                        {selectedCollection === 'stopwatch' && <StopwatchCollection displayMode="summary" />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionView;
