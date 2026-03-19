const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const todoRoutes = require('./routes/todo.routes');
const { errorHandler } = require('./middleware/errorHandler');
const { version } = require('../package.json');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    version,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/todos', todoRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;

