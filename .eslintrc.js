/* eslint-disable import/no-commonjs */
module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true,
    commonjs: true,
  },
  extends: [
    'taro/react',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  plugins: ['react'],
  rules: {
    // 0:不开启，1:警告，2:报错
    quotes: [1, 'single'], // 要求使用单引号
    'no-console': 0, // 禁止使用console
    'no-debugger': 1, // 禁止使用debugger
    'no-var': 0, // 禁止使用var
    semi: 0, // 要求使用分号
    'no-irregular-whitespace': 0, // 禁止不规则的空白
    'no-trailing-spaces': 1, // 一行结束后面禁止有空格
    'eol-last': 0, // 要求文件以单一的换行符结束
    'no-unused-vars': [1, { vars: 'all', args: 'none' }], // 禁止有声明后未被使用的变量或参数
    'no-underscore-dangle': 0, // 禁止标识符以_开头或结尾
    'no-alert': 1, // 禁止使用alert、confirm、prompt
    'no-lone-blocks': 0, // 禁止不必要的嵌套块
    'no-class-assign': 2, // 禁止给类赋值
    'no-cond-assign': 2, // 禁止在条件表达式中使用赋值语句
    'no-const-assign': 2, // 禁止修改const声明的变量
    'no-delete-var': 2, // 禁止对var声明的变量使用delete操作符
    'no-dupe-keys': 2, // 在创建对象字面量时不允许键重复
    'no-duplicate-case': 2, // switch中的case标签不能重复
    'no-dupe-args': 2, // 函数参数不能重复
    'no-empty': 2, // 块语句中的内容不能为空
    'no-func-assign': 2, // 禁止重复的函数声明
    'no-invalid-this': 0, // 禁止无效的this，只能用在构造器，类，对象字面量
    'no-redeclare': 2, // 禁止重复声明变量
    'no-spaced-func': 2, // 函数调用时 函数名与()之间不能有空格
    'no-this-before-super': 0, // 在调用super()之前不能使用this或super
    'no-undef': 2, // 不能有未定义的变量
    'no-use-before-define': 2, // 未定义前不能使用
    camelcase: 0, // 强制驼峰法命名
    'jsx-quotes': [2, 'prefer-double'], // 强制在JSX属性（jsx-quotes）中一致使用双引号
    'react/display-name': 0, // 防止在React组件定义中丢失displayName
    'react/forbid-prop-types': [2, { forbid: ['any'] }], // 禁止某些propTypes
    'react/jsx-boolean-value': 2, // 在JSX中强制布尔属性符号
    'react/jsx-closing-bracket-location': 1, // 在JSX中验证右括号位置
    'react/jsx-curly-spacing': [2, { when: 'never', children: true }], // 在JSX属性和表达式中加强或禁止大括号内的空格。
    'react/jsx-indent-props': [2, 2], // 验证JSX中的props缩进
    'react/jsx-key': 2, // 在数组或迭代器中验证JSX具有key属性
    'react/jsx-max-props-per-line': [0, { maximum: 5 }], // 限制JSX中单行上的props的最大数量
    'react/jsx-no-bind': 0, // JSX中不允许使用箭头函数和bind
    'react/jsx-no-duplicate-props': 2, // 防止在JSX中重复的props
    'react/jsx-no-literals': 0, // 防止使用未包装的JSX字符串
    'react/jsx-no-undef': 1, // 在JSX中禁止未声明的变量
    'react/jsx-pascal-case': 0, // 为用户定义的JSX组件强制使用PascalCase
    'react/jsx-sort-props': 0, // 强化props按字母排序
    'react/jsx-uses-react': 0, // 防止反应被错误地标记为未使用
    'react/jsx-uses-vars': 2, // 防止在JSX中使用的变量被错误地标记为未使用
    'react/no-danger': 0, // 防止使用危险的JSX属性
    'react/no-did-mount-set-state': 0, // 防止在componentDidMount中使用setState
    'react/no-did-update-set-state': 1, // 防止在componentDidUpdate中使用setState
    'react/no-direct-mutation-state': 2, // 防止this.state的直接变异
    'react/no-multi-comp': 0, // 防止每个文件有多个组件定义
    'react/no-set-state': 0, // 防止使用setState
    'react/no-unknown-property': 2, // 防止使用未知的DOM属性
    'react/prefer-es6-class': 2, // 为React组件强制执行ES5或ES6类
    'react/prop-types': 0, // 防止在React组件定义中丢失props验证
    'react/react-in-jsx-scope': 0, // JSX时需要引入React（React17后使用JSX无需引入React）
    'react/self-closing-comp': 0, // 防止没有children的组件的额外结束标签
    'react/sort-comp': 0, // 强制组件方法顺序
    'no-extra-boolean-cast': 0, // 禁止不必要的bool转换
    'react/no-array-index-key': 0, // 防止在数组中遍历中使用数组key做索引
    'react/no-deprecated': 1, // 不使用弃用的方法
    'react/jsx-equals-spacing': 2, // 在JSX属性中强制或禁止等号周围的空格
    'no-unreachable': 1, // 不能有无法执行的代码
    'comma-dangle': 0, // 对象字面量项尾不能有逗号
    'no-mixed-spaces-and-tabs': 2, // 禁止混用tab和空格
    'prefer-arrow-callback': 0, // 比较喜欢箭头回调
    'arrow-parens': 1, // 箭头函数用小括号括起来
    'arrow-spacing': 1, // =>的前/后括号
    'react/jsx-curly-brace-presence': 0, // JSX 使用花括号或禁止非必要的花括号
    '@typescript-eslint/no-shadow': 0, // 外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
    'import/no-unresolved': 0,
    'import/extensions': 0,
  },
}
