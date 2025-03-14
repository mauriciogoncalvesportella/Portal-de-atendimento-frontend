const CKEditorWebpackPlugin = require("@ckeditor/ckeditor5-dev-webpack-plugin");
const { styles } = require("@ckeditor/ckeditor5-dev-utils");
const { resolve } = require("path");

module.exports = {
  lintOnSave: false,
  pwa: {
    themeColor: "#1976D2",
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },

  devServer: {
    disableHostCheck: true,
  },

  filenameHashing: true,

  transpileDependencies: ["vuetify", /ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/],

  configureWebpack: {
    devtool: "source-map", // Garante que os arquivos fonte possam ser mapeados
    resolve: {
      alias: {
        path: require.resolve("path-browserify"), // Substituindo o path do Node pelo path-browserify
      },
    },

    plugins: [
      new CKEditorWebpackPlugin({
        // additionalLanguages: "all",
        language: "en",
        buildAllTranslationsToSeparateFiles: true, // Adiciona traduções a arquivos separados
        addMainLanguageTranslationsToAllAssets: true, // Adiciona as traduções do idioma principal a todos os arquivos
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
          // Desativa os avisos de depreciação
          quietDeps: true,
        },
      },
    },
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();
    // const svgRule = config.module.rule('svg')
    // svgRule.exclude.add(path.join(__dirname, 'node_modules', '@ckeditor'))
    // svgRule.exclude.add(path.join(__dirname, '..', 'node_modules', '@ckeditor'))
    svgRule.use("raw-loader").loader("raw-loader");
    /*
    config.module
      .rule('cke-svg')
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use('raw-loader')
      .loader('raw-loader')
    */
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
