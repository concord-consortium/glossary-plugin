module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "json", "react", "react-hooks"],
    env: {
        browser: true,
        es6: true
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"]
        },
        "import/resolver": {
          "node": {
            "extensions": [".js", ".jsx", ".ts", ".tsx", ".d.ts"]
          }
        },
        react: {
            pragma: "React",
            version: "detect"
        }
    },
    ignorePatterns: [
        "dist/", "node_modules/"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:eslint-comments/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:json/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended"
    ],
    rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-confusing-non-null-assertion": "error",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-shadow": ["error", { builtinGlobals: false, hoist: "all", allow: [] }],
        "@typescript-eslint/no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
        "@typescript-eslint/semi": ["warn", "always"],
        "curly": ["error", "multi-line", "consistent"],
        "dot-notation": "error",
        "eol-last": "warn",
        "eqeqeq": ["error", "smart"],
        "eslint-comments/no-unused-disable": "off",   // enabled in .eslintrc.build.js
        "import/no-cycle": ["warn"],
        "import/no-extraneous-dependencies":[ "warn"],
        "import/no-useless-path-segments": ["warn"],
        "import/no-unresolved": "warn",
        "jsx-quotes": "off",
        "max-len": ["off"],
        "no-bitwise": "error",
        "no-case-declarations": "off",
        "no-debugger": "off",
        "no-duplicate-imports": "error",
        "no-sequences": "error",
        "no-shadow": "off", // superseded by @typescript-eslint/no-shadow
        "no-tabs": "off",
        "no-unneeded-ternary": "error",
        "no-unused-expressions": ["error", { allowShortCircuit: true }],
        "no-unused-vars": "off",  // superseded by @typescript-eslint/no-unused-vars
        "no-useless-call": "warn",
        "no-useless-concat": "warn",
        "no-useless-escape": "off",
        "no-useless-rename": "warn",
        "no-useless-return": "off",
        "no-var": "error",
        "no-whitespace-before-property": "error",
        "object-shorthand": "error",
        "prefer-const": ["error", { destructuring: "all" }],
        "prefer-object-spread": "error",
        "prefer-regex-literals": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "quotes": ["error", "double", { allowTemplateLiterals: true, avoidEscape: true }],
        "radix": "error",
        "react/jsx-closing-tag-location": "error",
        "react/jsx-handler-names": "off",
        "react/jsx-no-useless-fragment": "warn",
        "react-hooks/rules-of-hooks": "warn",
        "react/no-access-state-in-setstate": "warn",
        "react/no-danger": "error",
        "react/no-render-return-value": "warn",
        "react/no-unescaped-entities": "off",
        "react/no-unsafe": ["off", { checkAliases: true }],
        "react/no-unused-state": "warn",
        "react/prop-types": "off",
        "semi": "off" // superseded by @typescript-eslint/semi
    },
    overrides: [
        { // rules specific to Jest tests
            files: ["src/**/*.test.*"],
            env: {
                node: true,
                jest: true
            },
            plugins: ["jest", "testing-library"],
            extends: ["plugin:jest/recommended", "plugin:testing-library/react"],
            rules: {
                "@typescript-eslint/no-non-null-assertion": "off",
                // require() can be useful in mocking
                "@typescript-eslint/no-require-imports": "off",
                "@typescript-eslint/no-var-requires": "off",
                "jest/no-done-callback": "off"
            }
        },
        { // eslint configs
            files: [".eslintrc*.js"],
            env: {
                node: true
            }
        },
        { // webpack configs
            files: ["**/webpack.config.js"],
            env: {
                node: true
            },
            rules: {
                "@typescript-eslint/no-require-imports": "off",
                "@typescript-eslint/no-var-requires": "off",
                "quotes": ["error", "single", { allowTemplateLiterals: true, avoidEscape: true }],
            }
        }
    ]
};
