import React, { useState, useRef, useEffect } from 'react';

const Diary = ({ selectedDate, userId }) => {
    const [title, setTitle] = useState('');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingTool, setDrawingTool] = useState('pen');
    const [penColor, setPenColor] = useState('black');
    const [penSize, setPenSize] = useState(8);
    const [texts, setTexts] = useState([]);
    const textRefs = useRef({});
    const [editingText, setEditingText] = useState(null);
    const [draggingText, setDraggingText] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const pushToHistory = (currentState = { texts, canvasData: canvasRef.current.toDataURL() }) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(currentState);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const restoreState = (state) => {
        const { canvasData, texts: newTexts } = state;
        setTexts(newTexts);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = canvasData;
    };

    useEffect(() => {
        const fetchDiary = async () => {
            if (!userId || !selectedDate) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            try {
                const res = await fetch(`http://localhost:3000/api/diaries/${userId}/${selectedDate}`);
                const data = await res.json();
                
                const loadedTexts = data?.texts || [];
                setTexts(loadedTexts);
                setTitle(data?.title || '');

                if (data?.canvasData) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                        const initialState = { canvasData: canvas.toDataURL(), texts: loadedTexts };
                        setHistory([initialState]);
                        setHistoryStep(0);
                    };
                    img.src = data.canvasData;
                } else {
                    const initialState = { canvasData: canvas.toDataURL(), texts: loadedTexts };
                    setHistory([initialState]);
                    setHistoryStep(0);
                }
            } catch (error) {
                console.error("Error fetching diary:", error);
                const initialState = { canvasData: canvas.toDataURL(), texts: [] };
                setHistory([initialState]);
                setHistoryStep(0);
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
        const ctx = canvas.getContext('2d');
        
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(canvas, 0, 0);

        texts.forEach(text => {
            finalCtx.font = '16px sans-serif';
            finalCtx.fillStyle = text.color || 'black';
            finalCtx.fillText(text.value, text.x, text.y);
        });

        const canvasData = finalCanvas.toDataURL();
        const diaryData = {
            userId,
            date: selectedDate,
            title,
            canvasData,
            texts,
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
    
    const undo = () => {
        if (historyStep > 0) {
            const newHistoryStep = historyStep - 1;
            setHistoryStep(newHistoryStep);
            restoreState(history[newHistoryStep]);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            const newHistoryStep = historyStep + 1;
            setHistoryStep(newHistoryStep);
            restoreState(history[newHistoryStep]);
        }
    };

    const startEditing = (id) => {
        setEditingText(id);
    };

    const handleCanvasMouseDown = ({ nativeEvent }) => {
        if (drawingTool === 'text') {
            if(editingText) {
                setEditingText(null);
            }
            return;
        }

        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const handleCanvasDoubleClick = ({ nativeEvent }) => {
        if (drawingTool === 'text') {
            const { offsetX, offsetY } = nativeEvent;
            const newText = {
                id: Date.now(),
                x: offsetX,
                y: offsetY,
                value: 'New Text',
                color: penColor,
            };
            const newTexts = [...texts, newText];
            setTexts(newTexts);
            startEditing(newText.id);
            pushToHistory({ texts: newTexts, canvasData: canvasRef.current.toDataURL() });
        }
    };
    
    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        
        if (drawingTool === 'eraser') {
            const newTexts = texts.filter(text => {
                const ref = textRefs.current[text.id];
                if (!ref) return true;
                const rect = ref.getBoundingClientRect();
                const canvasRect = canvasRef.current.getBoundingClientRect();
                const x = rect.left - canvasRect.left;
                const y = rect.top - canvasRect.top;
                return !(offsetX >= x && offsetX <= x + rect.width && offsetY >= y && offsetY <= y + rect.height);
            });
            if (newTexts.length !== texts.length) {
                setTexts(newTexts);
            }
        }
        
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

    const handleTextChange = (id, value) => {
        const newTexts = texts.map(t => t.id === id ? { ...t, value } : t);
        setTexts(newTexts);
    };

    const handleTextBlur = () => {
        const textToEdit = texts.find(t => t.id === editingText);
        if (textToEdit && textToEdit.value.trim() === '') {
             const newTexts = texts.filter(t => t.id !== editingText);
             setTexts(newTexts);
             pushToHistory({ texts: newTexts, canvasData: canvasRef.current.toDataURL() });
        } else {
            pushToHistory();
        }
        setEditingText(null);
    };
    
    const deleteText = (id) => {
        const newTexts = texts.filter(t => t.id !== id);
        setTexts(newTexts);
        pushToHistory({ texts: newTexts, canvasData: canvasRef.current.toDataURL() });
    };

    const handleTextDragStart = (id, e) => {
        e.stopPropagation();
        setDraggingText(id);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleTextDrag = (e) => {
        if (!draggingText) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const newTexts = texts.map(t =>
            t.id === draggingText
                ? { ...t, x: t.x + dx, y: t.y + dy }
                : t
        );
        setTexts(newTexts);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleTextDragEnd = () => {
        if(draggingText) {
            pushToHistory();
        }
        setDraggingText(null);
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
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div id="diary-content" className="record-content active" onMouseMove={handleTextDrag} onMouseUp={handleTextDragEnd}>
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
                                <button className="tool-btn" onClick={redo} disabled={historyStep >= history.length - 1}>↪️</button>
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
                    {drawingTool === 'text' && (
                        <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '4px', margin: '8px 0' }}>
                            Double-click on the canvas to add text.
                        </div>
                    )}
                    <div style={{ position: 'relative' }}>
                        <canvas 
                            id="diary-canvas" 
                            ref={canvasRef}
                            width="500"
                            height="300"
                            onMouseDown={handleCanvasMouseDown}
                            onDoubleClick={handleCanvasDoubleClick}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        ></canvas>
                        {texts.map(text => (
                            <div
                                key={text.id}
                                ref={el => textRefs.current[text.id] = el}
                                className="diary-text-box"
                                style={{
                                    position: 'absolute',
                                    top: text.y,
                                    left: text.x,
                                    cursor: 'move',
                                    border: editingText === text.id ? '2px solid #000' : 'none',
                                    padding: '2px',
                                }}
                                onMouseDown={(e) => handleTextDragStart(text.id, e)}
                                onDoubleClick={(e) => { e.stopPropagation(); startEditing(text.id); }}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteText(text.id); }}
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        background: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight:'1',
                                        padding: '0'
                                    }}
                                >
                                    &times;
                                </button>
                                {editingText === text.id ? (
                                    <textarea
                                        value={text.value}
                                        onChange={(e) => handleTextChange(text.id, e.target.value)}
                                        onBlur={handleTextBlur}
                                        autoFocus
                                        style={{
                                            font: '16px sans-serif',
                                            border: 'none',
                                            background: 'transparent',
                                            width: 'auto',
                                            height: 'auto',
                                            resize: 'none',
                                            outline: 'none',
                                        }}
                                    />
                                 ) : (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{text.value}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;

