const path = require('path');

module.exports = {
  extends: ['airbnb', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: [path.resolve(__dirname, 'src')],
      },
    },
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['**.js', '**.jsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
  rules: {
    // note you must disable the base rule as it can report incorrect errors
    'no-use-before-define': 'off',
    // eslint is running from root of the directory
    'import/no-unresolved': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    'guard-for-in': 'warn',
    'no-alert': 'error',
    'prettier/prettier': 'error',
    'react/display-name': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    'react/jsx-key': 'warn',
    'react/prop-types': 'warn',
    'max-classes-per-file': ['error', 2],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'react/destructuring-assignment': 'warn',
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'debug', 'error', 'assert'],
      },
    ],
  },
};
