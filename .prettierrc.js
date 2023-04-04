module.exports = {
  printWidth: 100, // 指定每行代码的最佳长度， 如果超出长度则换行
  tabWidth: 2, // 每个制表符占用的空格数
  useTabs: false, // 缩进是否使用tab
  singleQuote: true, // 如果为 true，将使用单引号而不是双引号
  semi: false, // 是否在每行末尾添加分号
  trailingComma: 'es5', // 在对象或数组最后一个元素后面是否加逗号（在ES5中加尾逗号）
  bracketSpacing: true, // 在对象，数组括号与文字之间加空格 "{ foo: bar }"
  jsxBracketSameLine: false, // 在jsx中把 '>' 单独放一行，false为单独放一行
  jsxSingleQuote: false, // 在jsx中是否使用单引号代替双引号
  arrowParens: 'always', //  (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号
}
