import React, { useState, useEffect, useMemo } from 'react';
import './DiaryCollection.css';
// import { useNavigate } from 'react-router-dom'; // Removed as back button is removed
import DateFilter from './DateFilter'; // Import the new component
import { useProfile } from './ProfileContext'; // Import useProfile
// import IllustratedCalendarIcon from './IllustratedCalendarIcon'; // Removed as calendar icon is removed

const DiaryCollection = () => {
    const [allDiaries, setAllDiaries] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filterRange, setFilterRange] = useState({ startDate: '', endDate: '' });
    // const navigate = useNavigate(); // Removed
    const { profile } = useProfile(); // Get profile from context

    useEffect(() => {
        const fetchDiaries = async () => {
            if (!profile.userId) return; // Wait for userId to be available
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/diaries/${profile.userId}`, {
                    cache: 'no-store' // Add this to prevent browser caching
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const formattedData = data.map(diary => ({
                    ...diary,
                    navDate: new Date(diary.date).toISOString().split('T')[0],
                    displayDate: new Date(diary.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '/').replace('.', ''),
                    image: diary.canvasImagePath ? `${process.env.REACT_APP_API_URL}${diary.canvasImagePath}` : null,
                }));
                setAllDiaries(formattedData);
            } catch (error) {
                console.error('Failed to fetch diaries:', error);
            }
        };

        fetchDiaries();

        const handleFocus = () => {
            fetchDiaries();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [profile.userId]); // Re-run effect when userId changes

    const displayedDiaries = useMemo(() => {
        if (!filterRange.startDate || !filterRange.endDate) {
            return allDiaries;
        }
        return allDiaries.filter(diary => {
            const diaryDate = new Date(diary.navDate);
            const startDate = new Date(filterRange.startDate);
            const endDateInclusive = new Date(filterRange.endDate);
            endDateInclusive.setDate(endDateInclusive.getDate() + 1); // Set to the day after the selected end date
            return diaryDate >= startDate && diaryDate < endDateInclusive;
        });
    }, [allDiaries, filterRange]);


    const handleCardClick = (id) => {
        // navigate(`/diary-view/id/${id}`); // Navigation will be handled by CollectionView or parent
    };

    // const handleGoBack = () => { // Removed
    //     navigate(-1);
    // };

    const handleApplyFilter = (range) => {
        setFilterRange(range);
        setIsFilterVisible(false);
    };

    const handleClearFilter = () => {
        setFilterRange({ startDate: '', endDate: '' });
    };

    const renderDiaryCard = (diary) => {
        const pastelColors = ['#ffd1dc', '#ffc3a0', '#fffdc4', '#c4eada', '#d7c4ff'];
        const randomPastel = diary.id ? pastelColors[diary.id % pastelColors.length] : pastelColors[0];

        return (
            <div key={diary.id} className="diary-card" onClick={() => handleCardClick(diary.id)}>
                <div 
                    className="card-thumbnail" 
                    style={{ 
                        backgroundImage: diary.image ? `url(${diary.image})` : 'none',
                        backgroundColor: diary.image ? 'transparent' : randomPastel
                    }}
                ></div>
                <div className="card-content">
                    <p className="card-title">{diary.title || '제목 없음'}</p>
                    <p className="card-date">{diary.displayDate}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="diary-collection-container">
            {isFilterVisible && (
                <DateFilter 
                    onApply={handleApplyFilter}
                    onCancel={() => setIsFilterVisible(false)}
                />
            )}
            {/* Removed header, back button, title, and calendar icon */}
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
                <div className="filter-toggle"> {/* Assuming filter-toggle still exists and is needed */}
                    <button onClick={() => setIsFilterVisible(true)}>날짜 필터</button>
                </div>
            </div>

            {filterRange.startDate && filterRange.endDate && (
                <div className="filter-status">
                    <p>
                        {`${filterRange.startDate} ~ ${filterRange.endDate}`}
                        <button onClick={handleClearFilter}>×</button>
                    </p>
                </div>
            )}

            {displayedDiaries.length > 0 ? (
                <div className="diary-grid">
                    {displayedDiaries.map(renderDiaryCard)}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-illustration">📝</div>
                    <p>해당 기간에 작성된 다이어리가 없어요.</p>
                </div>
            )}
        </div>
    );
};

export default DiaryCollection;
