module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-redeclare': 'off',
    'import/no-unresolved': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['node_modules', '.expo', 'dist', 'build'],
};
