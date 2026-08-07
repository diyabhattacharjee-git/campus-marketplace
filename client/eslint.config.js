import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        import: 'readonly',
        FormData: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Off, not warn: shadcn/ui-style files intentionally co-export a `cva`
      // variants object alongside the component (e.g. `buttonVariants` next
      // to `Button`), and AuthContext co-exports its `useAuth` hook. Both are
      // deliberate, accepted patterns — this rule only affects dev-time Fast
      // Refresh granularity, not correctness.
      'react-refresh/only-export-components': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
];
