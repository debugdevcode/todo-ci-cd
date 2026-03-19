/**
 * Unit tests for the Todo controller
 * The Mongoose model is fully mocked — no database or HTTP server needed.
 */
jest.mock('../../src/models/todo.model');
const Todo = require('../../src/models/todo.model');
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} = require('../../src/controllers/todo.controller');

// ── helpers ──────────────────────────────────────────────────────────────────

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const FAKE_ID = '64f1a2b3c4d5e6f7a8b9c0d1';
const SAMPLE_TODO = { _id: FAKE_ID, title: 'Buy milk', priority: 'high', completed: false };

// ── getAllTodos ───────────────────────────────────────────────────────────────

describe('getAllTodos', () => {
  it('returns paginated todos with success:true', async () => {
    const todos = [SAMPLE_TODO];
    Todo.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(todos),
        }),
      }),
    });
    Todo.countDocuments.mockResolvedValue(1);

    const req = { query: {} };
    const res = mockRes();
    await getAllTodos(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: todos,
        pagination: expect.objectContaining({ total: 1 }),
      })
    );
  });

  it('applies completed filter when query param is provided', async () => {
    Todo.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }),
    });
    Todo.countDocuments.mockResolvedValue(0);

    const req = { query: { completed: 'true' } };
    const res = mockRes();
    await getAllTodos(req, res);
    expect(Todo.find).toHaveBeenCalledWith(expect.objectContaining({ completed: true }));
  });

  it('applies priority filter when query param is provided', async () => {
    Todo.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }),
    });
    Todo.countDocuments.mockResolvedValue(0);

    const req = { query: { priority: 'high' } };
    const res = mockRes();
    await getAllTodos(req, res);
    expect(Todo.find).toHaveBeenCalledWith(expect.objectContaining({ priority: 'high' }));
  });
});

// ── getTodoById ───────────────────────────────────────────────────────────────

describe('getTodoById', () => {
  it('returns the todo when found', async () => {
    Todo.findById.mockResolvedValue(SAMPLE_TODO);
    const req = { params: { id: FAKE_ID } };
    const res = mockRes();
    await getTodoById(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: SAMPLE_TODO });
  });

  it('returns 404 when todo is not found', async () => {
    Todo.findById.mockResolvedValue(null);
    const req = { params: { id: FAKE_ID } };
    const res = mockRes();
    await getTodoById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

// ── createTodo ────────────────────────────────────────────────────────────────

describe('createTodo', () => {
  it('creates a todo and returns 201', async () => {
    Todo.create.mockResolvedValue(SAMPLE_TODO);
    const req = { body: { title: 'Buy milk', priority: 'high' } };
    const res = mockRes();
    await createTodo(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: SAMPLE_TODO });
  });
});

// ── updateTodo ────────────────────────────────────────────────────────────────

describe('updateTodo', () => {
  it('updates and returns the updated todo', async () => {
    const updated = { ...SAMPLE_TODO, title: 'Buy juice' };
    Todo.findByIdAndUpdate.mockResolvedValue(updated);
    const req = { params: { id: FAKE_ID }, body: { title: 'Buy juice' } };
    const res = mockRes();
    await updateTodo(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
  });

  it('returns 404 when todo does not exist', async () => {
    Todo.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { id: FAKE_ID }, body: { title: 'Whatever' } };
    const res = mockRes();
    await updateTodo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── deleteTodo ────────────────────────────────────────────────────────────────

describe('deleteTodo', () => {
  it('deletes the todo and returns success message', async () => {
    Todo.findByIdAndDelete.mockResolvedValue(SAMPLE_TODO);
    const req = { params: { id: FAKE_ID } };
    const res = mockRes();
    await deleteTodo(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Todo deleted successfully' });
  });

  it('returns 404 when todo does not exist', async () => {
    Todo.findByIdAndDelete.mockResolvedValue(null);
    const req = { params: { id: FAKE_ID } };
    const res = mockRes();
    await deleteTodo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── toggleTodo ────────────────────────────────────────────────────────────────

describe('toggleTodo', () => {
  it('toggles completed from false to true', async () => {
    const todo = { ...SAMPLE_TODO, completed: false, save: jest.fn().mockResolvedValue() };
    Todo.findById.mockResolvedValue(todo);
    const req = { params: { id: FAKE_ID } };
    const res = mockRes();
    await toggleTodo(req, res);
    expect(todo.completed).toBe(true);
    expect(todo.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('toggles completed from true to false', async () => {
    const todo = { ...SAMPLE_TODO, completed: true, save: jest.fn().mockResolvedValue() };
    Todo.findById.mockResolvedValue(todo);
    const req = { params: { id: FAKE_ID } };
    const res = mockRes();
    await toggleTodo(req, res);
    expect(todo.completed).toBe(false);
  });

  it('returns 404 when todo does not exist', async () => {
    Todo.findById.mockResolvedValue(null);
    const req = { params: { id: FAKE_ID } };
    const res = mockRes();
    await toggleTodo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
