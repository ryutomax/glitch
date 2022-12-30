"use strict";

module.exports = {

  mode: "production",
  // mode: "development",

  entry: './src/js/entry.js',
  output: {
    filename: 'bundle.js',
    // path: path.join(__dirname, 'dist/assets/js/'),
  },
  // devtool: 'source-map',  //source-map出力
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/,
      //   use: [
      //     {
      //       loader: 'babel-loader',
      //       options: {
      //         presets: [['@babel/preset-env', { modules: false }]],
      //       },
      //     },
      //   ],
      // },
      // {
      //   enforce: 'pre',
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader',
      // },
    ],
  },

    // devServer: {
    //   contentBase: path.resolve(__dirname, 'dist'),
    //   port: 8080,
    //   open: true,
    // },
  // }
}