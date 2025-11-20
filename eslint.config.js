const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.es2021
            }
        },
        rules: {
            'semi': ['error', 'never'],
            'quotes': ['error', 'single'],
            'no-unused-vars': 'warn'
        }
    }
]
