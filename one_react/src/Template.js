import React, { useState } from 'react'; // Keep useState

const Template = ({ type, templates = [], onTemplateClick, getTemplateStyle, onTemplateDeleteClick }) => {
    const [pressTimer, setPressTimer] = useState(null);
    const [activeTemplateId, setActiveTemplateId] = useState(null); // To track which template is long-pressed

    const handlePressStart = (templateId, e) => {
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        setPressTimer(setTimeout(() => {
            setActiveTemplateId(templateId); // Show 'x' for this template
        }, 2000)); // 2 seconds
    };

    const handlePressEnd = () => {
        clearTimeout(pressTimer);
        // setActiveTemplateId(null); // Don't hide immediately, let user click 'x' or click elsewhere
    };

    return (
        <div className="template-bar">
            {templates.map(template => (
                <button
                    key={template.id}
                    className="template-btn template-tag"
                    style={getTemplateStyle(template)}
                    onClick={() => {
                        if (activeTemplateId === template.id) {
                            // If 'x' is visible, a normal click should hide it
                            setActiveTemplateId(null);
                        } else {
                            onTemplateClick(template);
                        }
                    }}
                    onMouseDown={(e) => handlePressStart(template.id, e)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={(e) => handlePressStart(template.id, e)}
                    onTouchEnd={handlePressEnd}
                    onTouchCancel={handlePressEnd}
                >
                    {template.title}
                    {activeTemplateId === template.id && ( // Conditionally render 'x'
                        <span
                            className="delete-template-btn" // New class for styling
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering onTemplateClick
                                onTemplateDeleteClick(template);
                                setActiveTemplateId(null); // Hide 'x' after deletion attempt
                            }}
                        >
                            &times; {/* 'x' character */}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default Template;
