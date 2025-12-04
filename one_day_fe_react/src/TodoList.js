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
        </div>    );
};

export default TodoList;
