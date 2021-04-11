module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // disable max length of characters per line
    'max-len': 'off',
    // disable need for consistent return statements in functions
    'consistent-return': 'off',
    // disable no console logs
    'no-console': 'off',
  },
};
