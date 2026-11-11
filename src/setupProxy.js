const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  if (process.env.REACT_APP_USE_FIREBASE_EMULATORS === "false") {
    throw new Error("The local search proxy requires Firebase emulators.");
  }

  app.use(
    createProxyMiddleware({
      target: "http://127.0.0.1:5001",
      changeOrigin: true,
      pathFilter: (pathname) => pathname === "/api/searchProducts",
      pathRewrite: {
        "^/api/searchProducts":
          "/dream-closet-4d254/us-central1/searchProducts",
      },
      proxyTimeout: 30000,
      timeout: 35000,
    }),
  );
};
