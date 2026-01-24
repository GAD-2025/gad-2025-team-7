import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './StopwatchCollection.css'; // Import new CSS
import DateFilter from './DateFilter'; // Reuse DateFilter component
import IllustratedCalendarIcon from './IllustratedCalendarIcon';

// Helper to format seconds to HH:MM:SS
const formatTime = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return '00:00:00';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
};

// Pre-defined category colors
const categoryColors = {
    '공부': '#ffc4d5', // Pink
    '운동': '#ffeca9', // Yellow
    '알바': '#ffdcaa', // Orange
    '취미': '#c4f5d2', // Mint
    '기타': '#e9ecef',
};
const fallbackColors = Object.values(categoryColors);

const StopwatchCollection = () => {
    const [allRecords, setAllRecords] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for high, 'asc' for low
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filterRange, setFilterRange] = useState({ startDate: '', endDate: '' });
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        if (!userId) return;
        const fetchRecords = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stopwatch/${userId}`, {
                    cache: 'no-store'
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setAllRecords(data);
            } catch (error) {
                console.error('Failed to fetch stopwatch records:', error);
            }
        };
        fetchRecords();
    }, [userId]);

    const aggregatedData = useMemo(() => {
        const filteredRecords = allRecords.filter(record => {
            if (!filterRange.startDate || !filterRange.endDate) return true;
            // Perform string comparison to avoid timezone issues with `new Date()`
            const recordDateStr = record.date.split('T')[0];
            return recordDateStr >= filterRange.startDate && recordDateStr <= filterRange.endDate;
        });

        const dataByCategory = {};

        // Iterate through records, then tasks within each record
        filteredRecords.forEach(record => {
            if (record.tasks_data) {
                record.tasks_data.forEach(task => {
                    // Only include completed tasks
                    if (task.isComplete && task.category) {
                        if (!dataByCategory[task.category]) {
                            dataByCategory[task.category] = 0;
                        }
                        // Add elapsed time (which is in ms)
                        dataByCategory[task.category] += task.elapsedTime;
                    }
                });
            }
        });

        return Object.entries(dataByCategory).map(([category, totalTimeMs], index) => ({
            category,
            totalTime: Math.floor(totalTimeMs / 1000), // Convert ms to seconds
            color: categoryColors[category] || fallbackColors[index % fallbackColors.length]
        }));
    }, [allRecords, filterRange]);

    const sortedData = useMemo(() => {
        return [...aggregatedData].sort((a, b) => {
            return sortOrder === 'desc' ? b.totalTime - a.totalTime : a.totalTime - b.totalTime;
        });
    }, [aggregatedData, sortOrder]);

    const maxTime = useMemo(() => {
        return Math.max(...sortedData.map(d => d.totalTime), 0);
    }, [sortedData]);


    const handleApplyFilter = (range) => {
        setFilterRange(range);
        setIsFilterVisible(false);
    };

    const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="stopwatch-collection-container">
            {isFilterVisible && (
                <DateFilter 
                    onApply={handleApplyFilter}
                    onCancel={() => setIsFilterVisible(false)}
                />
            )}
            <header className="sc-header">
                <div className="sc-header-left">
                    <span className="sc-back-icon" onClick={handleGoBack}>←</span>
                    <h1 className="sc-title">스톱워치 모아보기</h1>
                </div>
                <div className="sc-header-right">
                    <div className="sc-filters">
                        <div className="filter-toggle">
                            <button className={sortOrder === 'desc' ? 'active' : ''} onClick={() => setSortOrder('desc')}>높은 순</button>
                            <button className={sortOrder === 'asc' ? 'active' : ''} onClick={() => setSortOrder('asc')}>낮은 순</button>
                        </div>
                    </div>
                    <IllustratedCalendarIcon onClick={() => setIsFilterVisible(true)} />
                </div>
            </header>

            {sortedData.length > 0 ? (
                <div className="sc-bar-chart-list">
                    {sortedData.map(({ category, totalTime, color }) => (
                        <div key={category} className="sc-category-item">
                            <div className="sc-category-label" style={{ backgroundColor: color }}>
                                {category}
                            </div>
                            <div className="sc-bar-wrapper">
                                <div className="sc-bar">
                                    <div 
                                        className="sc-bar-fill" 
                                        style={{ 
                                            width: `${maxTime > 0 ? (totalTime / maxTime) * 100 : 0}%`,
                                            backgroundColor: color 
                                        }}
                                    ></div>
                                </div>
                                <div className="sc-time">{formatTime(totalTime)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="sc-empty-state">
                    <div className="icon">⏱️</div>
                    <p>기록된 스톱워치 데이터가 없어요.</p>
                </div>
            )}
        </div>
    );
};

export default StopwatchCollection;
