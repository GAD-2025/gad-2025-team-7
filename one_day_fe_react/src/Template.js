import React, { useState } from 'react';
import Modal from './Modal';

const Template = ({ type, onTemplateClick }) => {
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateColor, setNewTemplateColor] = useState('#eee');
    const [customTemplates, setCustomTemplates] = useState(JSON.parse(localStorage.getItem(`${type}Templates`)) || []);

    const saveCustomTemplate = () => {
        if (newTemplateName) {
            const newTemplate = {
                name: newTemplateName,
                color: newTemplateColor,
            };
            const updatedTemplates = [...customTemplates, newTemplate];
            setCustomTemplates(updatedTemplates);
            localStorage.setItem(`${type}Templates`, JSON.stringify(updatedTemplates));
            setShowTemplateModal(false);
            setNewTemplateName('');
            setNewTemplateColor('#eee');
        }
    };

    return (
        <div className="template-bar">
            <button className="add-template-btn" onClick={() => setShowTemplateModal(true)}>+</button>
            {type === 'schedule' && (
                <>
                    <button className="template-btn" data-title="회의" data-category="work" onClick={() => onTemplateClick({ title: '회의', category: 'work' })}>회의</button>
                    <button className="template-btn" data-title="알바" data-category="work" onClick={() => onTemplateClick({ title: '알바', category: 'work' })}>알바</button>
                    <button className="template-btn" data-title="동아리" data-category="personal" onClick={() => onTemplateClick({ title: '동아리', category: 'personal' })}>동아리</button>
                </>
            )}
            {type === 'todo' && (
                <>
                    <button className="template-btn" onClick={() => onTemplateClick({ title: '장보기' })}>장보기</button>
                    <button className="template-btn" onClick={() => onTemplateClick({ title: '과제' })}>과제</button>
                </>
            )}
            {customTemplates.map(template => (
                <button 
                    key={template.name} 
                    className="template-btn custom-template" 
                    style={{ backgroundColor: template.color }}
                    onClick={() => onTemplateClick({ title: template.name, category: 'custom' })}
                >
                    {template.name}
                </button>
            ))}

            <Modal show={showTemplateModal} onClose={() => setShowTemplateModal(false)}>
                <h3>새 {type === 'schedule' ? '일정' : '투두'} 템플릿</h3>
                <input 
                    type="text" 
                    placeholder="템플릿 이름" 
                    value={newTemplateName} 
                    onChange={(e) => setNewTemplateName(e.target.value)} 
                />
                <p>템플릿 색상:</p>
                <div className="color-palette">
                    {['#eee', '#87CEEB', '#F08080', '#90EE90', '#DDA0DD'].map(color => (
                        <div 
                            key={color}
                            className={`color-box ${newTemplateColor === color ? 'active' : ''}`} 
                            style={{ backgroundColor: color }} 
                            onClick={() => setNewTemplateColor(color)}
                        ></div>
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={saveCustomTemplate}>저장</button>
                    <button onClick={() => setShowTemplateModal(false)}>취소</button>
                </div>
            </Modal>
        </div>
    );
};

export default Template;
