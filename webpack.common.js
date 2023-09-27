const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    main: "./src/main.js",  // Entry point 1
    index: "./src/index.js",  // Entry point 2
    test: "./src/test.js"  // Entry point 3
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
      filename: "main.html",
      chunks: ['main']  // Include only the 'main' chunk
    }),
    new HtmlWebpackPlugin({
      template: "./src/template2.html",
      filename: "index.html",
      chunks: ['index']  // Include only the 'index' chunk
    }),
    new HtmlWebpackPlugin({
        template: "./src/template-test.html",
        filename: "test.html",
        chunks: ['test']  // Include only the 'index' chunk
    }),
  ],
  devServer: {
    watchFiles: ["./src/*.html"],
    port: 8080,
    open: true,
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    onBeforeSetupMiddleware: function(devServer) {
      if (!devServer) {
        throw new Error('Webpack Dev Server is not defined');
      }
      devServer.app.get('/main/player*', function(req, res) {
        res.sendFile(path.join(__dirname, 'public', 'main.html'));
      }); 
      devServer.app.get('/test/player*', function(req, res) {
        res.sendFile(path.join(__dirname, 'public', 'test.html'));
      }); 
      devServer.app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
      });
    }
 }
}