import React from 'react';

const Template = ({ type, templates = [], onTemplateClick, getTemplateStyle }) => {
    return (
        <div className="template-bar">
            {templates.map(template => (
                <button
                    key={template.id}
                    className="template-btn template-tag"
                    style={getTemplateStyle(template)}
                    onClick={() => onTemplateClick(template)}
                >
                    {template.title}
                </button>
            ))}
        </div>
    );
};

export default Template;
