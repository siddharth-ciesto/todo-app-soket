// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));

app.get('/todos', (req, res) => {
    db.all("SELECT * FROM todos", [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

app.post('/todos', (req, res) => {
    const { task } = req.body;
    db.run("INSERT INTO todos (task, completed) VALUES (?, ?)", [task, 0], function(err) {
        if (err) {
            return console.log(err.message);
        }
        io.emit('todo-added', { id: this.lastID, task, completed: 0 });
        res.status(201).json({ id: this.lastID, task, completed: 0 });
    });
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { task, completed } = req.body;
    db.run("UPDATE todos SET task = ?, completed = ? WHERE id = ?", [task, completed, id], function(err) {
        if (err) {
            return console.log(err.message);
        }
        io.emit('todo-updated', { id, task, completed });
        res.status(200).json({ id, task, completed });
    });
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM todos WHERE id = ?", id, function(err) {
        if (err) {
            return console.log(err.message);
        }
        io.emit('todo-deleted', id);
        res.status(200).json({ id });
    });
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
