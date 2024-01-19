 const path = require('path');
 const HtmlWebpackPlugin = require('html-webpack-plugin');
 const CopyPlugin = require("copy-webpack-plugin");

 module.exports = {
   mode: 'development',
   entry: {
     index: './src/index.js',
   },
   devtool: 'inline-source-map',

  devServer: {
    static: './dist',

  },
   plugins: [
     new HtmlWebpackPlugin({
       title: 'Development',
       template: 'src/template.html'
     }),
     new CopyPlugin({
      patterns: [
        { from: "Layers", to: "Layers" },
        { from: path.resolve(__dirname, 'src/example.css'), to: "example.css" },
      ],
    }),
   ],
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
     clean: true,
   },

  optimization: {

    runtimeChunk: 'single',

  },
 };