import React, { useState, useEffect, useMemo } from 'react';
import './DiaryCollection.css';
import { useNavigate } from 'react-router-dom';
import DateFilter from './DateFilter'; // Import the new component

const DiaryCollection = () => {
    const [allDiaries, setAllDiaries] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filterRange, setFilterRange] = useState({ startDate: '', endDate: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDiaries = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/diaries/1'); // Temp userId 1
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const formattedData = data.map(diary => ({
                    ...diary,
                    navDate: new Date(diary.date).toISOString().split('T')[0],
                    displayDate: new Date(diary.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '/').replace('.', ''),
                    image: diary.canvasImagePath ? `http://localhost:3001${diary.canvasImagePath}` : null,
                }));
                setAllDiaries(formattedData);
            } catch (error) {
                console.error('Failed to fetch diaries:', error);
            }
        };

        fetchDiaries();
    }, []);

    const displayedDiaries = useMemo(() => {
        if (!filterRange.startDate || !filterRange.endDate) {
            return allDiaries;
        }
        return allDiaries.filter(diary => {
            const diaryDate = new Date(diary.navDate);
            const startDate = new Date(filterRange.startDate);
            const endDate = new Date(filterRange.endDate);
            return diaryDate >= startDate && diaryDate <= endDate;
        });
    }, [allDiaries, filterRange]);


    const handleCardClick = (date) => {
        navigate(`/diary/${date}`);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleApplyFilter = (range) => {
        setFilterRange(range);
        setIsFilterVisible(false);
    };

    const handleClearFilter = () => {
        setFilterRange({ startDate: '', endDate: '' });
    };

    const renderDiaryCard = (diary) => {
        const pastelColors = ['#ffd1dc', '#ffc3a0', '#fffdc4', '#c4eada', '#d7c4ff'];
        const randomPastel = pastelColors[diary.id % pastelColors.length];

        return (
            <div key={diary.id} className="diary-card" onClick={() => handleCardClick(diary.navDate)}>
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
            <header className="dc-header">
                <div className="dc-header-left">
                    <span className="dc-back-icon" onClick={handleGoBack}>←</span>
                    <h1 className="dc-title">다이어리 모아보기</h1>
                </div>
                <span className="dc-filter-icon" onClick={() => setIsFilterVisible(true)}>📅</span>
            </header>

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
