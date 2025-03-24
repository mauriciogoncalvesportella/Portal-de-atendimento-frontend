const CKEditorWebpackPlugin = require("@ckeditor/ckeditor5-dev-webpack-plugin");
const { styles } = require("@ckeditor/ckeditor5-dev-utils");
const { resolve } = require("path");

module.exports = {
  devServer: {
    allowedHosts: ["localhost", "127.0.0.1", ".localhost", "all"],
    host: "0.0.0.0",
    port: 8080,
    https: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, version-control",
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        pathRewrite: { "^/api": "/api" },
        onProxyRes: (proxyRes, req, res) => {
          proxyRes.headers["Access-Control-Allow-Origin"] = "*";
        },
      },
      "/api/socketio": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  lintOnSave: false,
  pwa: {
    themeColor: "#1976D2",
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },
  filenameHashing: true,
  transpileDependencies: ["vuetify", /ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/],
  configureWebpack: {
    devtool: "source-map",
    resolve: {
      alias: {
        path: require.resolve("path-browserify"),
      },
    },
    plugins: [
      new CKEditorWebpackPlugin({
        language: "pt",
        additionalLanguages: ["en"],
        buildAllTranslationsToSeparateFiles: true,
        addMainLanguageTranslationsToAllAssets: true,
      }),
    ],
    output: {
      filename: "[name].[hash].bundle.js",
    },
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          quietDeps: true,
        },
      },
    },
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();
    svgRule.use("raw-loader").loader("raw-loader");

    // Configuração adicional para CKEditor
    config.module
      .rule("cke-svg")
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use("raw-loader")
      .loader("raw-loader");

    config.module
      .rule("cke-css")
      .test(/ckeditor5-[^/\\]+[/\\].+\.css$/)
      .use("postcss-loader")
      .loader("postcss-loader")
      .tap(() => {
        return styles.getPostCssConfig({
          themeImporter: {
            themePath: require.resolve("@ckeditor/ckeditor5-theme-lark"),
          },
          minify: true,
        });
      });
  },
};
