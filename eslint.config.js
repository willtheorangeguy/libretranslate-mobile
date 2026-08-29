const reactNativeConfig = require('@react-native/eslint-config/flat');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      '**/*.d.ts',
    ],
  },
  ...reactNativeConfig,
  // This project is TypeScript-only (no Flow types), and eslint-plugin-ft-flow
  // (pulled in transitively by @react-native/eslint-config for `.js` files)
  // relies on removed/deprecated ESLint context APIs and crashes the linter.
  // Disable it outright rather than working around a dead API.
  {
    rules: {
      'ft-flow/define-flow-type': 'off',
      'ft-flow/use-flow-type': 'off',
    },
  },
  // Project-specific overrides (mirrors the old .eslintrc.js `rules`/`settings`)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
