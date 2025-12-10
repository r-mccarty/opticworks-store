const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    // Output as IIFE to work in Hookdeck's runtime
    iife: true,
  },
  // Hookdeck provides addHandler globally
  externals: {
    // Don't bundle these - they're provided by Hookdeck runtime
  },
  optimization: {
    // Keep readable for debugging in Hookdeck console
    minimize: false,
  },
  resolve: {
    extensions: ['.js'],
  },
};
