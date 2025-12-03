import React, { useState, useRef, useEffect } from 'react';

const Diary = ({ selectedDate, diaries, setDiaries }) => {
    const diaryForDay = diaries.find(d => d.date === selectedDate) || { title: '', text: '', canvasData: '' };
    const [title, setTitle] = useState(diaryForDay.title);
    const [text, setText] = useState(diaryForDay.text);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingTool, setDrawingTool] = useState('pen');
    const [penColor, setPenColor] = useState('black');
    const [penSize, setPenSize] = useState(8);
    const [editorMode, setEditorMode] = useState('text');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [canvasHistory, setCanvasHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    useEffect(() => {
        setTitle(diaryForDay.title);
        setText(diaryForDay.text);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (diaryForDay.canvasData) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    const initialHistory = [canvas.toDataURL()];
                    setCanvasHistory(initialHistory);
                    setHistoryStep(0);
                };
                img.src = diaryForDay.canvasData;
            } else {
                const initialHistory = [canvas.toDataURL()];
                setCanvasHistory(initialHistory);
                setHistoryStep(0);
            }
        }
    }, [selectedDate, diaries]);

    const saveDiary = () => {
        const canvas = canvasRef.current;
        const canvasData = canvas ? canvas.toDataURL() : '';
        const newDiary = {
            id: diaryForDay.id || Date.now(),
            date: selectedDate,
            title,
            text,
            canvasData,
        };
        const newDiaries = diaries.filter(d => d.date !== selectedDate);
        setDiaries([...newDiaries, newDiary]);
        alert('다이어리가 저장되었습니다.');
    };

    const pushToHistory = () => {
        const canvas = canvasRef.current;
        const newHistory = canvasHistory.slice(0, historyStep + 1);
        newHistory.push(canvas.toDataURL());
        setCanvasHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep > 0) {
            const newHistoryStep = historyStep - 1;
            setHistoryStep(newHistoryStep);
            redrawFromHistory(newHistoryStep);
        }
    };

    const redo = () => {
        if (historyStep < canvasHistory.length - 1) {
            const newHistoryStep = historyStep + 1;
            setHistoryStep(newHistoryStep);
            redrawFromHistory(newHistoryStep);
        }
    };

    const redrawFromHistory = (step) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = canvasHistory[step];
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = penColor;
        ctx.lineWidth = drawingTool === 'eraser' ? penSize * 2 : penSize;
        ctx.globalCompositeOperation = drawingTool === 'pen' ? 'source-over' : 'destination-out';
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
        pushToHistory();
    };

    const addEmoji = (emoji) => {
        setText(text + emoji);
    };

    const handleImageUpload = (e) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                pushToHistory();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    return (
        <div id="diary-content" className="record-content active">
            <div className="dashboard-section">
                <div className="section-header">
                    <h3>다이어리</h3>
                    <div className="header-actions">
                        <button className="save-btn" onClick={saveDiary}>저장</button>
                    </div>
                </div>
                
                <div id="diary-editor">
                    <input 
                        type="text" 
                        id="diary-title" 
                        placeholder="제목을 입력하세요" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                    />
                    <div className="diary-toolbar">
                        <div className="mode-selectors">
                            <button className={`tool-btn ${editorMode === 'text' ? 'active' : ''}`} onClick={() => setEditorMode('text')}>📝</button>
                            <button className={`tool-btn ${editorMode === 'drawing' ? 'active' : ''}`} onClick={() => setEditorMode('drawing')}>✏️</button>
                        </div>
                        {editorMode === 'text' ? (
                            <div className="text-tools">
                                <label className="tool-btn" htmlFor="image-upload-input">🖼️
                                    <input type="file" id="image-upload-input" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} />
                                </label>
                                <div className="emoji-container">
                                    <button className="tool-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
                                    {showEmojiPicker && (
                                        <div className="emoji-picker">
                                            <div className="emoji-tabs">
                                                <button className="emoji-tab-btn active" data-category="faces">표정</button>
                                                <button className="emoji-tab-btn" data-category="food">음식</button>
                                                <button className="emoji-tab-btn" data-category="activities">활동</button>
                                            </div>
                                            <div className="emoji-content">
                                                <div id="faces" className="emoji-grid active">
                                                    {'😊😂😍🤔😴😠😢😮😎🥳'.split('').map(emoji => <span key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</span>)}
                                                </div>
                                                <div id="food" className="emoji-grid">
                                                    {'🍎🍔🍕🍰☕🍜🍣🍦🍉🍓'.split('').map(emoji => <span key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</span>)}
                                                </div>
                                                <div id="activities" className="emoji-grid">
                                                    {'⚽🏀🎸🎮✈️📚🎉🎁🎤🎨'.split('').map(emoji => <span key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="drawing-tools" style={{display: 'flex'}}>
                                <div className="tool-buttons">
                                    <button className={`tool-btn ${drawingTool === 'pen' ? 'active' : ''}`} onClick={() => setDrawingTool('pen')}>✏️</button>
                                    <button className={`tool-btn ${drawingTool === 'eraser' ? 'active' : ''}`} onClick={() => setDrawingTool('eraser')}>🧼</button>
                                    <button className="tool-btn" onClick={undo} disabled={historyStep <= 0}>↩️</button>
                                    <button className="tool-btn" onClick={redo} disabled={historyStep >= canvasHistory.length - 1}>↪️</button>
                                </div>
                                <div className="color-palette">
                                    <div className={`color-box ${penColor === 'black' ? 'active' : ''}`} style={{backgroundColor: 'black'}} data-color="black" onClick={() => setPenColor('black')}></div>
                                    <div className={`color-box ${penColor === 'red' ? 'active' : ''}`} style={{backgroundColor: 'red'}} data-color="red" onClick={() => setPenColor('red')}></div>
                                    <div className={`color-box ${penColor === 'blue' ? 'active' : ''}`} style={{backgroundColor: 'blue'}} data-color="blue" onClick={() => setPenColor('blue')}></div>
                                    <div className={`color-box ${penColor === 'green' ? 'active' : ''}`} style={{backgroundColor: 'green'}} data-color="green" onClick={() => setPenColor('green')}></div>
                                </div>
                                <div className="size-controls">
                                    <button className={`size-btn ${penSize === 3 ? 'active' : ''}`} onClick={() => setPenSize(3)}>S</button>
                                    <button className={`size-btn ${penSize === 8 ? 'active' : ''}`} onClick={() => setPenSize(8)}>M</button>
                                    <button className={`size-btn ${penSize === 15 ? 'active' : ''}`} onClick={() => setPenSize(15)}>L</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {editorMode === 'text' ? (
                        <textarea 
                            id="diary-textarea" 
                            rows="5" 
                            placeholder="오늘의 하루를 기록해보세요..." 
                            value={text} 
                            onChange={(e) => setText(e.target.value)}
                        ></textarea>
                    ) : (
                        <canvas 
                            id="diary-canvas" 
                            ref={canvasRef}
                            width="500"
                            height="300"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        ></canvas>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Diary;
