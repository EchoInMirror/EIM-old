module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: 'node-loader'
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@marshallofsound/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules'
      }
    }
  },
  {
    test: /\.(ttf|eot|woff2?)$/,
    use: 'file-loader'
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: [
      {
        loader: 'babel-loader'
      },
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  {
    test: /\.ejs$/i,
    use: [
      {
        loader: 'html-loader'
      },
      {
        loader: 'ejs-plain-loader'
      }
    ]
  }
]
