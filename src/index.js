const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { use } = require('express/lib/application');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  if (users.find(user => user.username === request.body.username)) {
    return response.status(400).json({ error: 'User already exists'});
  }

  next();
}



app.post('/users', checksExistsUserAccount, (request, response) => {
  const user = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: [],
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const username = request.get('username');
  const user = users.find(user => user.username === username);
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const todo = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date(),
  }
  const username = request.get('username');
  const user = users.find(user => user.username === username);
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.get('username');
  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) { 
    response.status(404).json({ error: 'Todo not exists'});
  }
  todo.title = request.body.title;
  todo.deadline = new Date(request.body.deadline);
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.get('username');
  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) { 
    response.status(404).json({ error: 'Todo not exists'});
  }
  todo.done = true;
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const username = request.get('username');
  const user = users.find(user => user.username === username);
  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) { 
    response.status(404).json({ error: 'Todo not exists'});
  }
  user.todos = user.todos.filter(todo => todo.id !== id);
  return response.status(204).json(todo);
});

module.exports = app;