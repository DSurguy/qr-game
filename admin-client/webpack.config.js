const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

require('dotenv').config({
  path: ".env"
});

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
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
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
    new DefinePlugin({
      PROCESS_ENV_API_KEY: JSON.stringify(process.env.API_KEY),
      PROCESS_ENV_SERVER_ORIGIN: JSON.stringify(process.env.SERVER_ORIGIN),
      PROCESS_ENV_CLIENT_ORIGIN: JSON.stringify(process.env.CLIENT_ORIGIN)
    }),
    new HtmlWebpackPlugin()
  ]
}