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
            <button className="add-template-btn" onClick={() => setShowTemplateModal(true)}>✏️</button>
            {type === 'schedule' && (
                <>
                    <button
                        className="template-btn template-tag tag-blue"
                        data-title="회의"
                        data-category="work"
                        onClick={() => onTemplateClick({ title: '회의', category: 'work', color: '#9DDBFF' })} // color 추가
                    >
                        회의
                    </button>
                    <button
                        className="template-btn template-tag tag-yellow"
                        data-title="알바"
                        data-category="work"
                        onClick={() => onTemplateClick({ title: '알바', category: 'work', color: '#FFE79D' })} // color 추가
                    >
                        알바
                    </button>
                    <button
                        className="template-btn template-tag tag-gray"
                        data-title="동아리"
                        data-category="personal"
                        onClick={() => onTemplateClick({ title: '동아리', category: 'personal', color: '#A5A5A5' })} // color 추가
                    >
                        동아리
                    </button>
                </>
            )}
            {type === 'todo' && (
                <>
                    <button className="template-btn template-tag tag-orange" onClick={() => onTemplateClick({ title: '장보기', color: '#FFA544' })}>장보기</button> // color 추가
                    <button className="template-btn template-tag tag-green" onClick={() => onTemplateClick({ title: '과제', color: '#9DFFA7' })}>과제</button> // color 추가
                </>
            )}
            {customTemplates.map(template => (
                <button
                    key={template.name}
                    className="template-btn custom-template"
                    style={{ backgroundColor: template.color }}
                    onClick={() => onTemplateClick({ title: template.name, category: 'custom', color: template.color })} // color 추가
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

                {customTemplates.length > 0 && (
                    <div className="existing-templates-list">
                        <h4>기존 템플릿:</h4>
                        {customTemplates.map(template => (
                            <div key={template.name} className="existing-template-item">
                                <span className="existing-template-color" style={{ backgroundColor: template.color }}></span>
                                <span>{template.name}</span>
                                <button
                                    className="delete-existing-template-btn"
                                    onClick={() => handleDeleteCustomTemplateFromModal(template)}
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Template;
