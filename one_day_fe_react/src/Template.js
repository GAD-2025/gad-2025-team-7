import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const Template = ({ type, onTemplateClick }) => {
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateColor, setNewTemplateColor] = useState('#eee');
    const [customTemplates, setCustomTemplates] = useState(JSON.parse(localStorage.getItem(`${type}Templates`)) || []);

    useEffect(() => {
        // Update localStorage if customTemplates changes
        localStorage.setItem(`${type}Templates`, JSON.stringify(customTemplates));
    }, [customTemplates, type]);

    const saveCustomTemplate = () => {
        if (newTemplateName.trim()) {
            const newTemplate = {
                name: newTemplateName.trim(),
                color: newTemplateColor,
            };
            const updatedTemplates = [...customTemplates, newTemplate];
            setCustomTemplates(updatedTemplates);
            setShowTemplateModal(false);
            setNewTemplateName('');
            setNewTemplateColor('#eee');
        } else {
            alert('템플릿 이름을 입력해주세요.');
        }
    };

    const handleDeleteCustomTemplateFromModal = (templateToDelete) => {
        const updatedTemplates = customTemplates.filter(
            (template) => template.name !== templateToDelete.name
        );
        setCustomTemplates(updatedTemplates);
    };

    return (
        <div className="template-bar">
            {type === 'schedule' && (
                <>
                    <button
                        className="template-btn template-tag tag-blue"
                        data-title="회의"
                        data-category="work"
                        onClick={() => onTemplateClick({ title: '회의', category: 'work', color: '#9DDBFF' })}
                    >
                        회의
                    </button>
                </>
            )}
            {type === 'todo' && (
                <>
                    <button className="template-btn template-tag tag-orange" onClick={() => onTemplateClick({ title: '장보기', color: '#FFA544' })}>장보기</button>
                </>
            )}
            {/* Removed customTemplates.map */}

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

                {/* Removed existing-templates-list */}
            </Modal>
        </div>
);
};

export default Template;
