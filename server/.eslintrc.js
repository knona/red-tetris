module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './server/tsconfig.json',
    sourceType: 'module'
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', './']
      }
    }
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-import',
    'eslint-plugin-prettier',
    'eslint-plugin-promise',
    'promise'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:promise/recommended'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { vars: 'all', varsIgnorePattern: '^_', args: 'all', argsIgnorePattern: '^_', caughtErrors: 'none' }
    ],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'never'],
    '@typescript-eslint/comma-spacing': [2, { before: false, after: true }],
    'max-len': ['error', { code: 120, ignoreStrings: true, ignoreRegExpLiterals: true }],
    'max-lines': ['error', 1050],
    'no-empty': ['error'],
    eqeqeq: ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-empty-interface': ['error'],
    curly: ['error'],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/typedef': [
      'error',
      {
        arrayDestructuring: false,
        arrowParameter: false,
        memberVariableDeclaration: true,
        objectDestructuring: false,
        parameter: true,
        propertyDeclaration: true,
        variableDeclaration: true
      }
    ],
    '@typescript-eslint/explicit-function-return-type': ['error'],
    '@typescript-eslint/explicit-member-accessibility': ['error'],
    '@typescript-eslint/explicit-module-boundary-types': ['error', { allowArgumentsExplicitlyTypedAsAny: true }],
    '@typescript-eslint/ban-types': ['error', { types: { object: false } }]
  }
};
