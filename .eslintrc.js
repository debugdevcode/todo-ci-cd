module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-process-exit': 'off',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error',
  },
};
