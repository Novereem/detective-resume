/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: [
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        'react/react-in-jsx-scope': 'off',

        // Be less strict globally on any / unused vars
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
    },

    overrides: [
        {
            files: [
                'src/components/DetectiveRoom/**/*.{ts,tsx}',
                'src/components/Models/**/*.{ts,tsx}',
                'src/components/Effects/**/*.{ts,tsx}',
                'src/components/Puzzles/**/*.{ts,tsx}',
            ],
            rules: {
                'react/no-unknown-property': 'off',
            },
        },

        {
            files: [
                '**/__tests__/**/*.{ts,tsx}',
                '**/*.test.{ts,tsx}',
            ],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'warn',
                    {
                        argsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                    },
                ],
            },
        },
    ],
}
