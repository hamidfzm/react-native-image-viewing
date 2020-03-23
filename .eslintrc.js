module.exports = {
    root: true,
    extends: ["@react-native-community"],
    rules: {
        quotes: ["error", "double"],
    },
    env: {
        jest: true // now **/*.test.js files' env has both es6 *and* jest
    },
};
