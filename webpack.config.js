'use strict';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';

  return {
    context: __dirname, // to automatically find tsconfig.json
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    entry: {
      demo: './src/demo.tsx',
      plugin: './src/plugin.tsx',
      authoring: './src/authoring.tsx',
      dashboard: './src/dashboard.tsx'
    },
    mode: devMode ? 'development' : 'production',
    performance: { hints: false },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          enforce: 'pre',
          use: [
            {
              loader: 'tslint-loader',
              options: {}
            }
          ]
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
          }
        },
        {
          test: /\.(sa|sc|c)ss$/i,
          use: [
            // For now, always bundle CSS into JS to keep plugin development simple. In the future, we might
            // want to create a separate CSS file. Then, we we'll use following config instead:
            // devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: true,
                importLoaders: 1,
                localIdentName: '[name]--[local]--[hash:base64:8]'
              }
            },
            'postcss-loader',
            'sass-loader'
          ]
        },
        { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader' }
      ]
    },
    resolve: {
      extensions: [ '.ts', '.tsx', '.js' ]
    },
    stats: {
      // suppress "export not found" warnings about re-exported types
      warningsFilter: /export .* was not found in/
    },
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      '@concord-consortium/lara-plugin-api': 'LARA.PluginAPI_V3'
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: "plugin.css"
      }),
      new CopyWebpackPlugin({
        patterns: [
          {from: 'src/public'}
        ]
      })
    ]
  };
};
