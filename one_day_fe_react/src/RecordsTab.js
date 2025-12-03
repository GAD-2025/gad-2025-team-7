import React, { useState } from 'react';
import Diary from './Diary';
import Stopwatch from './Stopwatch';

const RecordsTab = ({ selectedDate, diaries, setDiaries }) => {
    const [activeRecordTab, setActiveRecordTab] = useState('diary-content');

    return (
        <div id="records-tab" className="dash-tab-content active">
            <div className="record-menu">
                <button 
                    className={`record-menu-btn ${activeRecordTab === 'diary-content' ? 'active' : ''}`} 
                    onClick={() => setActiveRecordTab('diary-content')}
                >
                    다이어리
                </button>
                <button 
                    className={`record-menu-btn ${activeRecordTab === 'stopwatch-content' ? 'active' : ''}`} 
                    onClick={() => setActiveRecordTab('stopwatch-content')}
                >
                    스톱워치
                </button>
            </div>

            {activeRecordTab === 'diary-content' && <Diary selectedDate={selectedDate} diaries={diaries} setDiaries={setDiaries} />}
            {activeRecordTab === 'stopwatch-content' && <Stopwatch />}
        </div>
    );
};

export default RecordsTab;
