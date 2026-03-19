/**
 * Unit tests for the Todo Mongoose model
 * Uses mongodb-memory-server so the schema, validators, and defaults
 * are exercised against a real (but in-memory) MongoDB instance.
 */
require('../setup');
const Todo = require('../../src/models/todo.model');

describe('Todo model — schema defaults', () => {
  it('sets completed to false by default', async () => {
    const todo = await Todo.create({ title: 'Test default' });
    expect(todo.completed).toBe(false);
  });

  it('sets priority to "medium" by default', async () => {
    const todo = await Todo.create({ title: 'Test priority default' });
    expect(todo.priority).toBe('medium');
  });

  it('adds createdAt and updatedAt timestamps automatically', async () => {
    const todo = await Todo.create({ title: 'Timestamp test' });
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });
});

describe('Todo model — validation', () => {
  it('rejects a todo with no title', async () => {
    await expect(Todo.create({})).rejects.toThrow('Title is required');
  });

  it('rejects a title longer than 100 characters', async () => {
    await expect(Todo.create({ title: 'a'.repeat(101) })).rejects.toThrow();
  });

  it('rejects a description longer than 500 characters', async () => {
    await expect(
      Todo.create({ title: 'Valid title', description: 'x'.repeat(501) })
    ).rejects.toThrow();
  });

  it('rejects an invalid priority value', async () => {
    await expect(
      Todo.create({ title: 'Valid title', priority: 'urgent' })
    ).rejects.toThrow();
  });

  it('accepts valid priority values', async () => {
    for (const priority of ['low', 'medium', 'high']) {
      const todo = await Todo.create({ title: `Priority ${priority}`, priority });
      expect(todo.priority).toBe(priority);
    }
  });

  it('trims whitespace from title', async () => {
    const todo = await Todo.create({ title: '  Buy milk  ' });
    expect(todo.title).toBe('Buy milk');
  });
});

describe('Todo model — CRUD operations', () => {
  it('creates, reads, updates, and deletes a record', async () => {
    // Create
    const created = await Todo.create({ title: 'Lifecycle test', priority: 'low' });
    expect(created._id).toBeDefined();

    // Read
    const found = await Todo.findById(created._id);
    expect(found.title).toBe('Lifecycle test');

    // Update
    found.completed = true;
    await found.save();
    const updated = await Todo.findById(created._id);
    expect(updated.completed).toBe(true);

    // Delete
    await Todo.findByIdAndDelete(created._id);
    const deleted = await Todo.findById(created._id);
    expect(deleted).toBeNull();
  });
});
