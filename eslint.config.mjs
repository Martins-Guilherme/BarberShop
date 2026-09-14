import { defineConfig, globalIgnores } from 'eslint/config'
import nextTs from 'eslint-config-next/typescript'
import nextPlugin from '@next/eslint-plugin-next'

const eslintConfig = defineConfig(
  [
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
      // Default ignores of eslint-config-next:
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ]),
  ],
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  }
)

export default eslintConfig
