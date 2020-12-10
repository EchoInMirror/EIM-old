const rules = require('./webpack.rules')
const plugins = require('./webpack.plugins')

rules.push({
  test: /\.(c|le)ss$/,
  exclude: /(node_modules|\.webpack)/,
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader'
    },
    {
      loader: 'less-loader'
    }
  ]
})

module.exports = {
  module: {
    rules
  },
  devServer: {
    hot: true
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  }
}
