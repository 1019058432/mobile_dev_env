import { resolve } from 'path'

const config = {
  projectName: 'mobile-dev-env',
  date: '2023-04-04',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  plugins: [
    [
      '@tarojs/plugin-html',
      {
        pxtransformBlackList: [/am-/, /demo-/, /^body/],
      },
    ],
  ],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: true, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  alias: {
    '@': resolve(__dirname, '..', 'src'), // 别名路径配置
    'antd-mobile': 'antd-mobile/2x',
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 2048, // 设定转换尺寸上限
        },
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    esnextModules: ['antd-mobile', 'taro-ui', /@antmjs[\\/]vantui/],
    // publicPath: '.', // webview嵌入本项目时使用配置
    // publicPath: '/h5/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          ignoreFragmentWarning: true, // 内联带有片段的 SVG URL 时不发出警告
        },
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    // router: {
    //   mode: 'hash',
    // },
    imageUrlLoaderOption: {
      limit: 1024 * 100,
    },
    fontUrlLoaderOption: {
      limit: 1024 * 100,
    },
  },
  rn: {
    appName: 'taroDemo',
    postcss: {
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
      },
    },
  },
}

module.exports = function(merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
