const path = require('path');
const webpack = require('webpack');
const { DefinePlugin } = webpack;

module.exports = {
  entry: './src/main.ts',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'generated')
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.(png|svg|jpg|gif)$/,
      use: [
        'file-loader'
      ]
    }, {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        'file-loader'
      ]
    }, {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
      resolve: {
          extensions: ['.ts', '.tsx', '.wasm', '.mjs', '.js', '.json']
      } 
    },{
      test: /\.js$/,
      use: ["source-map-loader"],
      enforce: "pre"
    }]
  },
  watchOptions: {
    poll: true
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default']
    }),
    new DefinePlugin({
      'process.env.COUCH_DB_ADDRESS': JSON.stringify(process.env.COUCH_DB_ADDRESS || 'http://couchdb.home.agrzes.pl:5984')
    })
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  }
};
