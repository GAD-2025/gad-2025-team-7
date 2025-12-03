import React, { useState, useRef, useEffect } from 'react';

const Diary = ({ selectedDate, userId }) => {
    const [title, setTitle] = useState('');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingTool, setDrawingTool] = useState('pen');
    const [penColor, setPenColor] = useState('black');
    const [penSize, setPenSize] = useState(8);
    const [textInput, setTextInput] = useState(null);
    const [canvasHistory, setCanvasHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    useEffect(() => {
        const fetchDiary = async () => {
            if (!userId || !selectedDate) return;
            try {
                const res = await fetch(`http://localhost:3000/api/diaries/${userId}/${selectedDate}`);
                const data = await res.json();
                if (data) {
                    setTitle(data.title || '');
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (data.canvasData) {
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            const initialHistory = [canvas.toDataURL()];
                            setCanvasHistory(initialHistory);
                            setHistoryStep(0);
                        };
                        img.src = data.canvasData;
                    } else {
                        const initialHistory = [canvas.toDataURL()];
                        setCanvasHistory(initialHistory);
                        setHistoryStep(0);
                    }
                } else {
                    setTitle('');
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const initialHistory = [canvas.toDataURL()];
                    setCanvasHistory(initialHistory);
                    setHistoryStep(0);
                }
            } catch (error) {
                console.error("Error fetching diary:", error);
            }
        };

        fetchDiary();
    }, [selectedDate, userId]);

    const saveDiary = async () => {
        if (!userId) {
            alert('로그인이 필요합니다.');
            return;
        }
        const canvas = canvasRef.current;
        const canvasData = canvas ? canvas.toDataURL() : '';
        const diaryData = {
            userId,
            date: selectedDate,
            title,
            canvasData,
        };

        try {
            const res = await fetch('http://localhost:3000/api/diaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(diaryData),
            });
            if (res.ok) {
                alert('다이어리가 저장되었습니다.');
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (error) {
            console.error("Error saving diary:", error);
            alert('저장 중 오류가 발생했습니다.');
        }
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

    const handleCanvasMouseDown = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        if (drawingTool === 'text') {
            setTextInput({ x: offsetX, y: offsetY, value: '' });
        } else { // pen or eraser
            const ctx = canvasRef.current.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            setIsDrawing(true);
        }
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || drawingTool === 'text') return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = penColor;
        ctx.lineWidth = drawingTool === 'eraser' ? penSize * 2 : penSize;
        ctx.globalCompositeOperation = drawingTool === 'pen' ? 'source-over' : 'destination-out';
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.closePath();
            setIsDrawing(false);
            pushToHistory();
        }
    };

    const handleTextBlur = () => {
        if (!textInput) return;
        const { x, y, value } = textInput;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.font = '16px sans-serif';
        ctx.fillStyle = penColor;
        ctx.fillText(value, x, y);
        setTextInput(null);
        pushToHistory();
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
                
                <div id="diary-editor" style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        id="diary-title" 
                        placeholder="제목을 입력하세요" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                    />
                    <div className="diary-toolbar">
                        <div className="drawing-tools" style={{display: 'flex'}}>
                            <div className="tool-buttons">
                                <button className={`tool-btn ${drawingTool === 'pen' ? 'active' : ''}`} onClick={() => setDrawingTool('pen')}>✏️</button>
                                <button className={`tool-btn ${drawingTool === 'eraser' ? 'active' : ''}`} onClick={() => setDrawingTool('eraser')}>🧼</button>
                                <button className={`tool-btn ${drawingTool === 'text' ? 'active' : ''}`} onClick={() => setDrawingTool('text')}>T</button>
                                <label className="tool-btn" htmlFor="image-upload-input">🖼️
                                    <input type="file" id="image-upload-input" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} />
                                </label>
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
                    </div>
                    <div style={{ position: 'relative' }}>
                        <canvas 
                            id="diary-canvas" 
                            ref={canvasRef}
                            width="500"
                            height="300"
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        ></canvas>
                        {textInput && (
                            <textarea
                                style={{
                                    position: 'absolute',
                                    top: textInput.y,
                                    left: textInput.x,
                                    border: '2px solid #000',
                                    zIndex: 10,
                                }}
                                value={textInput.value}
                                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                                onBlur={handleTextBlur}
                                autoFocus
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;
