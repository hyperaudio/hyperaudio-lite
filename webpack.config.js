var webpack = require('webpack');
var minimize = process.argv.indexOf('--no-minimize') === -1 ? true : false;
var plugins = minimize ? [new webpack.optimize.UglifyJsPlugin({
  minimize: true,
  compress: {
    drop_console: true
  }
})] : [];

module.exports = {
  entry: './src/hyperaudio-lite.js',
  output: {
    path: './dist',
    filename: minimize ? 'hyperaudio-lite.min.js' : 'hyperaudio-lite.js',
    libraryTarget: 'umd',
    library: 'HyperaudioLite'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel'
    }]
  },
  plugins: plugins
};
