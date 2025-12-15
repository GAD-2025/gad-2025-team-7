import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Diary = ({ selectedDate, userId }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingTool, setDrawingTool] = useState('pen');
    const [penColor, setPenColor] = useState('black');
    const [penSize, setPenSize] = useState(8);
    
    const [texts, setTexts] = useState([]);
    const textRefs = useRef({});
    const [editingText, setEditingText] = useState(null);
    
    const [images, setImages] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // { type: 'text' | 'image', id }
    const [draggingItem, setDraggingItem] = useState(null); // { type: 'text' | 'image', id }
    const [resizingImage, setResizingImage] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const pushToHistory = (currentState = { texts, images, canvasData: canvasRef.current.toDataURL() }) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(currentState);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const restoreState = (state) => {
        const { canvasData, texts: newTexts, images: newImages } = state;
        setTexts(newTexts || []);
        setImages(newImages || []);
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
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/diaries/${userId}/${selectedDate}`);
                const data = await res.json();
                
                const loadedTexts = data?.texts || [];
                const loadedImages = data?.images || [];
                setTexts(loadedTexts);
                setImages(loadedImages);
                setTitle(data?.title || '');

                if (data?.canvasImagePath) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous'; // Handle potential CORS issues
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                        const initialState = { canvasData: canvas.toDataURL(), texts: loadedTexts, images: loadedImages };
                        setHistory([initialState]);
                        setHistoryStep(0);
                    };
                    img.src = `${process.env.REACT_APP_API_URL}${data.canvasImagePath}`;
                } else {
                    const initialState = { canvasData: canvas.toDataURL(), texts: loadedTexts, images: loadedImages };
                    setHistory([initialState]);
                    setHistoryStep(0);
                }
            } catch (error) {
                console.error("Error fetching diary:", error);
                const initialState = { canvasData: canvas.toDataURL(), texts: [], images: [] };
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
        
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(canvas, 0, 0);

        const imageLoadPromises = images.map(image => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = image.src;
                img.onload = () => {
                    finalCtx.drawImage(img, image.x, image.y, image.width, image.height);
                    resolve();
                };
                img.onerror = () => resolve(); // Continue even if an image fails to load
            });
        });

        await Promise.all(imageLoadPromises);

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
        };

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/diaries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(diaryData),
            });
            if (res.ok) {
                alert('다이어리가 저장되었습니다.');
                navigate('/diary-collection');
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

    const startEditingText = (id) => {
        setSelectedItem({ type: 'text', id });
        setEditingText(id);
    };

    const handleCanvasMouseDown = ({ nativeEvent }) => {
        setSelectedItem(null);
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
            const newText = { id: Date.now(), x: offsetX, y: offsetY, value: 'New Text', color: penColor };
            const newTexts = [...texts, newText];
            setTexts(newTexts);
            startEditingText(newText.id);
            pushToHistory({ texts: newTexts, images, canvasData: canvasRef.current.toDataURL() });
        }
    };
    
    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        if (drawingTool === 'eraser') {
            // This part is complex and might be revisited. For now, it erases canvas content.
        }
        
        const ctx = canvas.getContext('2d');
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

    // Text handlers
    const handleTextChange = (id, value) => {
        const newTexts = texts.map(t => t.id === id ? { ...t, value } : t);
        setTexts(newTexts);
    };

    const handleTextBlur = () => {
        const textToEdit = texts.find(t => t.id === editingText);
        if (textToEdit && textToEdit.value.trim() === '') {
             const newTexts = texts.filter(t => t.id !== editingText);
             setTexts(newTexts);
             pushToHistory({ texts: newTexts, images, canvasData: canvasRef.current.toDataURL() });
        } else {
            pushToHistory();
        }
        setEditingText(null);
    };
    
    const deleteText = (id) => {
        const newTexts = texts.filter(t => t.id !== id);
        setTexts(newTexts);
        pushToHistory({ texts: newTexts, images, canvasData: canvasRef.current.toDataURL() });
    };

    // Image handlers
    const deleteImage = (id) => {
        const newImages = images.filter(img => img.id !== id);
        setImages(newImages);
        pushToHistory({ texts, images: newImages, canvasData: canvasRef.current.toDataURL() });
    };
    
    const handleImageUpload = (e) => {
        if (!e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const MAX_WIDTH = canvas.width * 0.5;
                const MAX_HEIGHT = canvas.height * 0.5;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                const newImage = { id: Date.now(), src: img.src, x: 0, y: 0, width, height, ratio: width / height };
                const newImages = [...images, newImage];
                setImages(newImages);
                pushToHistory({ texts, images: newImages, canvasData: canvasRef.current.toDataURL() });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    // Drag and Resize Handlers
    const handleItemDragStart = (type, id, e) => {
        e.stopPropagation();
        setSelectedItem({ type, id });
        setDraggingItem({ type, id });
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleImageResizeStart = (id, e) => {
        e.stopPropagation();
        setResizingImage(id);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (draggingItem) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            if (draggingItem.type === 'text') {
                setTexts(texts.map(t => t.id === draggingItem.id ? { ...t, x: t.x + dx, y: t.y + dy } : t));
            } else if (draggingItem.type === 'image') {
                setImages(images.map(img => img.id === draggingItem.id ? { ...img, x: img.x + dx, y: img.y + dy } : img));
            }
            setDragStart({ x: e.clientX, y: e.clientY });
        } else if (resizingImage) {
            const dx = e.clientX - dragStart.x;
            setImages(images.map(img => {
                if (img.id === resizingImage) {
                    const newWidth = img.width + dx;
                    return { ...img, width: newWidth, height: newWidth / img.ratio };
                }
                return img;
            }));
            setDragStart({ x: e.clientX, y: e.clientY });
        } else if(isDrawing) {
            draw(e);
        }
    };

    const handleMouseUp = () => {
        if (draggingItem || resizingImage) {
            pushToHistory();
        }
        setDraggingItem(null);
        setResizingImage(null);
        stopDrawing();
    };

    return (
        <div id="diary-content" className="record-content active" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="dashboard-section">
                <div className="section-header">
                    <h3>다이어리</h3>
                    <div className="header-actions">
                        <button className="save-btn" onClick={saveDiary}>저장</button>
                    </div>
                </div>
                
                <div id="diary-editor" style={{ position: 'relative' }}>
                    <input type="text" id="diary-title" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                    {drawingTool === 'text' && ( <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '4px', margin: '8px 0' }}> Double-click on the canvas to add text. </div> )}
                    <div style={{ position: 'relative' }}>
                        <canvas 
                            id="diary-canvas" 
                            ref={canvasRef}
                            width="500"
                            height="300"
                            onMouseDown={handleCanvasMouseDown}
                            onDoubleClick={handleCanvasDoubleClick}
                        ></canvas>
                        {/* Render Images */}
                        {images.map(image => {
                            const isSelected = selectedItem?.type === 'image' && selectedItem?.id === image.id;
                            return (
                                <div
                                    key={image.id}
                                    style={{
                                        position: 'absolute',
                                        top: image.y,
                                        left: image.x,
                                        width: image.width,
                                        height: image.height,
                                        cursor: 'move',
                                        border: isSelected ? '1px dashed #000' : 'none',
                                    }}
                                    onMouseDown={(e) => handleItemDragStart('image', image.id, e)}
                                >
                                    <img src={image.src} alt="" style={{ width: '100%', height: '100%' }} />
                                    {isSelected && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); deleteImage(image.id); }} style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '20px', height: '20px' }}>&times;</button>
                                            <div onMouseDown={(e) => handleImageResizeStart(image.id, e)} style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', width: '10px', height: '10px', background: 'blue', cursor: 'se-resize' }}></div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                        {/* Render Texts */}
                        {texts.map(text => {
                             const isSelected = selectedItem?.type === 'text' && selectedItem?.id === text.id;
                             return (
                                <div
                                    key={text.id}
                                    ref={el => textRefs.current[text.id] = el}
                                    className="diary-text-box"
                                    style={{ position: 'absolute', top: text.y, left: text.x, cursor: 'move', border: editingText === text.id ? '2px solid #000' : (isSelected ? '1px dashed #000' : 'none'), padding: '2px' }}
                                    onMouseDown={(e) => handleItemDragStart('text', text.id, e)}
                                    onDoubleClick={(e) => { e.stopPropagation(); startEditingText(text.id); }}
                                >
                                    {isSelected && editingText !== text.id && (
                                         <button onClick={(e) => { e.stopPropagation(); deleteText(text.id); }} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight:'1', padding: '0' }}>&times;</button>
                                    )}
                                    {editingText === text.id ? (
                                        <textarea
                                            value={text.value}
                                            onChange={(e) => handleTextChange(text.id, e.target.value)}
                                            onBlur={handleTextBlur}
                                            autoFocus
                                            style={{ font: '16px sans-serif', border: 'none', background: 'transparent', width: 'auto', height: 'auto', resize: 'none', outline: 'none' }}
                                        />
                                     ) : (
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{text.value}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;

