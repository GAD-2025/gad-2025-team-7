import React from 'react';

const TodoList = ({ selectedDate, todos, setTodos }) => {
    const todosForDay = todos.filter(t => t.date === selectedDate);

    const toggleTodoCompletion = (todoId) => {
        setTodos(todos.map(todo => 
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (todoId) => {
        setTodos(todos.filter(todo => todo.id !== todoId));
    };

    return (
        <div className="dashboard-section todo-main">
            <div className="section-header">
                <h3>투두리스트</h3>
                <div className="header-actions">
                    <button className="add-btn" id="add-todo-btn">+</button>
                </div>
            </div>
            <div id="add-todo-form" className="inline-form" style={{display: 'none'}}>
                <input type="text" id="new-todo-title" placeholder="새로운 할 일" />
                <div>
                    <label><input type="checkbox" id="new-todo-repeat" /> 매주 반복</label>
                </div>
                <div id="repeat-end-date-container" style={{display: 'none'}}>
                    <label htmlFor="new-todo-end-date">언제까지:</label>
                    <input type="date" id="new-todo-end-date" />
                </div>
                <button id="save-todo-btn">저장</button>
            </div>
            <div id="todolist-list" className="section-content">
                {todosForDay.length === 0 ? (
                    <p>등록된 투두리스트가 없습니다.</p>
                ) : (
                    <ul>
                        {todosForDay.map(todo => (
                            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                                <input 
                                    type="checkbox" 
                                    checked={todo.completed} 
                                    onChange={() => toggleTodoCompletion(todo.id)} 
                                />
                                <span>{todo.title}</span>
                                <button className="delete-item-btn" onClick={() => deleteTodo(todo.id)}>×</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TodoList;
