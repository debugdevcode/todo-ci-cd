const { validationResult, body, param } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateCreateTodo = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title max 100 chars'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  handleValidationErrors,
];

const validateUpdateTodo = [
  param('id').isMongoId().withMessage('Invalid todo ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('completed').optional().isBoolean(),
  handleValidationErrors,
];

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid todo ID'),
  handleValidationErrors,
];

module.exports = { validateCreateTodo, validateUpdateTodo, validateMongoId };
