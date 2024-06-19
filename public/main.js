const socket = io();

document.getElementById('todo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const task = document.getElementById('task').value;
    fetch('/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task })
    }).then(response => response.json()).then(todo => {
        document.getElementById('task').value = '';
    });
});

socket.on('todo-added', (todo) => {
    addTodoToList(todo);
});

socket.on('todo-updated', (todo) => {
    updateTodoInList(todo);
});

socket.on('todo-deleted', (id) => {
    removeTodoFromList(id);
});

function addTodoToList(todo) {
    const todoList = document.getElementById('todo-list');
    const li = document.createElement('li');
    li.id = `todo-${todo.id}`;
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
        <span>${todo.task}</span>
        <div>
            <button class="btn btn-success btn-sm mr-2" onclick="toggleComplete(${todo.id}, ${todo.completed})">${todo.completed ? 'Uncomplete' : 'Complete'}</button>
            <button class="btn btn-warning btn-sm mr-2" onclick="showEditModal(${todo.id}, '${todo.task}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `;
    todoList.appendChild(li);
}

function updateTodoInList(todo) {
    const li = document.getElementById(`todo-${todo.id}`);
    li.innerHTML = `
        <span>${todo.task}</span>
        <div>
            <button class="btn btn-success btn-sm mr-2" onclick="toggleComplete(${todo.id}, ${todo.completed})">${todo.completed ? 'Uncomplete' : 'Complete'}</button>
            <button class="btn btn-warning btn-sm mr-2" onclick="showEditModal(${todo.id}, '${todo.task}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `;
}

function removeTodoFromList(id) {
    const li = document.getElementById(`todo-${id}`);
    li.remove();
}

function deleteTodo(id) {
    fetch(`/todos/${id}`, {
        method: 'DELETE'
    });
}

function toggleComplete(id, completed) {
    const task = document.querySelector(`#todo-${id} span`).innerText;
    fetch(`/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task, completed: !completed })
    });
}

function showEditModal(id, task) {
    document.getElementById('edit-task').value = task;
    document.getElementById('save-edit').onclick = () => saveEdit(id);
    $('#editModal').modal('show');
}

function saveEdit(id) {
    const task = document.getElementById('edit-task').value;
    fetch(`/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task, completed: false })
    }).then(() => {
        $('#editModal').modal('hide');
    });
}
