// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  // parser: 'babel-eslint',
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2017,
    sourceType: "module"
  },
  env: {
    browser: true
  },
  extends: ["plugin:vue/essential", "airbnb-base"],
  // required to lint *.vue files
  plugins: ["vue"],
  // check if imports actually resolve
  settings: {
    "import/resolver": {
      webpack: {
        config: "build/webpack.base.conf.js"
      }
    }
  },
  // add your custom rules here
  rules: {
    // don't require .vue extension when importing
    "import/extensions": [
      "error",
      "always",
      {
        js: "never",
        vue: "never"
      }
    ],
    "no-param-reassign": [
      "error",
      {
        props: true,
        ignorePropertyModificationsFor: [
          "state", // for vuex state
          "acc", // for reduce accumulators
          "e" // for e.returnvalue
        ]
      }
    ],
    quotes: [0, "double"], //引号类型 `` "" ''
    "prefer-destructuring": "off",
    // "indent": ["off", 4],
    "no-console": ["off"],
    "max-len": ["off"],
    "linebreak-style": "off",
    "array-callback-return": "off",
    // allow optionalDependencies
    "import/no-extraneous-dependencies": [
      "error",
      {
        optionalDependencies: ["test/unit/index.js"]
      }
    ],
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0
  },
  globals: {
    $: false,
    jquery: false
  }
};
