module.exports = {
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {},
  mini: {
    miniCssExtractPluginOption: {
      //忽略css文件引入顺序
      ignoreOrder: true,
    },
  },
  h5: {
    publicPath: '/h5/',
  },
}
