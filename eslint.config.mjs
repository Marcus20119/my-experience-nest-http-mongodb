import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import perfectionist from 'eslint-plugin-perfectionist'
import prettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sonarjs from 'eslint-plugin-sonarjs'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import unicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import importPlugin from 'eslint-plugin-import'
import jsoncParser from 'jsonc-eslint-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  {
    ignores: ['**/node_modules', '**/dist', '**/docs', '**/*.yaml', '**/*.generated.ts', '**/*.js'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:import/recommended',
      'plugin:deprecation/recommended',
      'plugin:unicorn/recommended',
      'plugin:sonarjs/recommended-legacy',
    ),
  ).map((config) => ({
    ...config,
    files: ['**/*.ts'],
    ignores: ['**/*.json'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {},
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      perfectionist,
      prettier: fixupPluginRules(prettier),
      'simple-import-sort': simpleImportSort,
      sonarjs: fixupPluginRules(sonarjs),
      'sort-destructure-keys': sortDestructureKeys,
      unicorn: fixupPluginRules(unicorn),
      'unused-imports': unusedImports,
      import: fixupPluginRules(importPlugin),
    },
    rules: {
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      eqeqeq: ['error', 'smart'],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'max-lines': [
        'error',
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'no-async-promise-executor': 'error',
      'no-else-return': [
        'error',
        {
          allowElseIf: false,
        },
      ],

      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'object-shorthand': 'error',

      /* Sort Rules */
      'perfectionist/sort-enums': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-object-types': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-exports': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-interfaces': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],

      'perfectionist/sort-jsx-props': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],

      'perfectionist/sort-named-exports': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-union-types': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'alphabetical',
        },
      ],

      'simple-import-sort/imports': 'error',
      'sort-destructure-keys/sort-destructure-keys': [2, { caseSensitive: false }],
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
          },

          ignore: [String.raw`^\d+-.*$`],
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/no-static-only-class': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  })),
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: fixupPluginRules(eslintPluginJsonc),
    },
    rules: {
      'jsonc/sort-keys': [
        'error',
        'asc',
        {
          caseSensitive: true,
          natural: false,
          minKeys: 2,
          allowLineSeparatedGroups: false,
        },
      ],
    },
  },
]
