/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/api/esbapi': {
      target: 'http://localhost:8000',//后端实际api地址
      changeOrigin: true,
      //pathRewrite会对前端的请求地址截取 如前端访问地址
      //http://localhost:8888/api/esbapi/manager/cm0004 截取/api/esbapi后再重新定位到 后端 http://127.0.0.1:56668/manager
      pathRewrite: { '^': '' },
    }
  },
  test: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
