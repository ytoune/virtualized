// @ts-check
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
// @ts-expect-error: ignore
import _import from 'eslint-plugin-import'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  { ignores: ['node_modules', 'dist', '.cache', '.swc', 'scripts/sandbox*'] },
  ...fixupConfigRules(
    compat.extends(
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'plugin:import/typescript',
      'plugin:github/recommended',
      'plugin:github/typescript',
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
    },
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: { project: ['tsconfig.json'] },
    },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        'eslint-import-resolver-typescript': true,
      },
      'import/parsers': {
        '@typescript-eslint/parser': [
          '.ts',
          '.tsx',
          '.mts',
          '.cts',
          '.js',
          '.jsx',
          '.mjs',
          '.cjs',
        ],
      },
    },
    rules: {
      yoda: ['error', 'always', { exceptRange: true, onlyEquality: true }],
      complexity: ['error', 20],
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'func-style': ['error', 'expression'],
      'filenames/match-regex': 'off',
      'no-console': 'off',
      'no-negated-condition': 'off',
      'eslint-comments/no-use': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'eslint-comments/no-duplicate-disable': 'off',
      'import/order': 'error',
      'import/no-default-export': 'off',
      'import/no-cycle': 'off',
      'import/no-namespace': 'off',
      'github/no-then': 'off',
      'i18n-text/no-en': 'off',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]
