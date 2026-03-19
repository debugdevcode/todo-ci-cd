require('./setup');
const request = require('supertest');
const app = require('../src/app');
const Todo = require('../src/models/todo.model');

describe('GET /health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
  });
});

describe('Todo API', () => {
  const sampleTodo = { title: 'Buy groceries', description: 'Milk and eggs', priority: 'high' };

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const res = await request(app).post('/api/todos').send(sampleTodo);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(sampleTodo.title);
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.priority).toBe('high');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app).post('/api/todos').send({ description: 'no title' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if title exceeds 100 chars', async () => {
      const res = await request(app).post('/api/todos').send({ title: 'a'.repeat(101) });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid priority', async () => {
      const res = await request(app).post('/api/todos').send({ title: 'Test', priority: 'urgent' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/todos', () => {
    beforeEach(async () => {
      await Todo.insertMany([
        { title: 'Task 1', priority: 'low', completed: false },
        { title: 'Task 2', priority: 'high', completed: true },
        { title: 'Task 3', priority: 'medium', completed: false },
      ]);
    });

    it('should return all todos', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination.total).toBe(3);
    });

    it('should filter by completed status', async () => {
      const res = await request(app).get('/api/todos?completed=true');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].completed).toBe(true);
    });

    it('should filter by priority', async () => {
      const res = await request(app).get('/api/todos?priority=high');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].priority).toBe('high');
    });

    it('should paginate results', async () => {
      const res = await request(app).get('/api/todos?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.pages).toBe(2);
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a single todo', async () => {
      const todo = await Todo.create(sampleTodo);
      const res = await request(app).get(`/api/todos/${todo._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(todo._id.toString());
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app).get('/api/todos/64f1a2b3c4d5e6f7a8b9c0d1');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid mongo id', async () => {
      const res = await request(app).get('/api/todos/invalid-id');
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const todo = await Todo.create(sampleTodo);
      const res = await request(app)
        .put(`/api/todos/${todo._id}`)
        .send({ title: 'Updated title', completed: true });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated title');
      expect(res.body.data.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app)
        .put('/api/todos/64f1a2b3c4d5e6f7a8b9c0d1')
        .send({ title: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const todo = await Todo.create(sampleTodo);
      const res = await request(app).delete(`/api/todos/${todo._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const deleted = await Todo.findById(todo._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app).delete('/api/todos/64f1a2b3c4d5e6f7a8b9c0d1');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    it('should toggle completed from false to true', async () => {
      const todo = await Todo.create({ ...sampleTodo, completed: false });
      const res = await request(app).patch(`/api/todos/${todo._id}/toggle`);
      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it('should toggle completed from true to false', async () => {
      const todo = await Todo.create({ ...sampleTodo, completed: true });
      const res = await request(app).patch(`/api/todos/${todo._id}/toggle`);
      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(false);
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
    });
  });
});
