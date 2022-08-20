const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: 
  {
    extensions: [ '.tsx', '.ts', '.js', '.json', '.jsx' ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../new-types')
        ],
        use: ["babel-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../new-types')
        ],
        use: ["ts-loader"],
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src'),
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ]
  },
  devServer: {
    static: 'dist',
    historyApiFallback: true,
    client: {
      overlay: false
    },
  },
  devtool: 'eval-source-map',
  plugins: [
    new HtmlWebpackPlugin()
  ]
}