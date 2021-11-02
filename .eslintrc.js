module.exports = {
    env: {
        node: true,
        commonjs: true,
        es6: true,
    },
    extends: ['eslint:recommended', 'prettier'],
    plugins: ['prettier'],
    parser: "babel-eslint",
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'linebreak-style': ['warn', 'unix'],
        semi: ['error', 'never'],
        'no-tabs': 'off',
        'object-property-newline': 'off',
        'require-atomic-updates': 'off',
        'prettier/prettier': 'error',
        'no-useless-escape': "off",
    },
    overrides: [
        {
            "files": ["./*.js"]
        }
    ]
}