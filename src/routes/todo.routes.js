const express = require('express');
const router = express.Router();
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} = require('../controllers/todo.controller');
const { validateCreateTodo, validateUpdateTodo, validateMongoId } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', asyncHandler(getAllTodos));
router.get('/:id', validateMongoId, asyncHandler(getTodoById));
router.post('/', validateCreateTodo, asyncHandler(createTodo));
router.put('/:id', validateUpdateTodo, asyncHandler(updateTodo));
router.delete('/:id', validateMongoId, asyncHandler(deleteTodo));
router.patch('/:id/toggle', validateMongoId, asyncHandler(toggleTodo));

module.exports = router;
