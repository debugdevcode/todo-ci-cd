const Todo = require('../models/todo.model');

const getAllTodos = async (req, res) => {
  const { completed, priority, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (completed !== undefined) { filter.completed = completed === 'true'; }
  if (priority) { filter.priority = priority; }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [todos, total] = await Promise.all([
    Todo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Todo.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: todos,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
};

const getTodoById = async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }
  res.json({ success: true, data: todo });
};

const createTodo = async (req, res) => {
  const todo = await Todo.create(req.body);
  res.status(201).json({ success: true, data: todo });
};

const updateTodo = async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }
  res.json({ success: true, data: todo });
};

const deleteTodo = async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }
  res.json({ success: true, message: 'Todo deleted successfully' });
};

const toggleTodo = async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }
  todo.completed = !todo.completed;
  await todo.save();
  res.json({ success: true, data: todo });
};

module.exports = { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo, toggleTodo };
