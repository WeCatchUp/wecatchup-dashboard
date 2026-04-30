const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://210.61.15.8:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
};
