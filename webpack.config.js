'use strict';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

// DEPLOY_PATH is set by the s3-deploy-action its value will be:
// `branch/[branch-name]/` or `version/[tag-name]/`
// See the following documentation for more detail:
//   https://github.com/concord-consortium/s3-deploy-action/blob/main/README.md#top-branch-example
const DEPLOY_PATH = process.env.DEPLOY_PATH;

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
      dashboard: './src/dashboard.tsx',
      'model-authoring-demo': './src/model-authoring-demo.tsx'
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
      new HtmlWebpackPlugin({
        filename: 'authoring.html',
        template: 'src/public/authoring.html',
        publicPath: '.',
      }),
      ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
        filename: 'authoring-top.html',
        template: 'src/public/authoring.html',
        publicPath: DEPLOY_PATH
      })] : []),
      new HtmlWebpackPlugin({
        filename: 'dashboard.html',
        template: 'src/public/dashboard.html',
        publicPath: '.',
      }),
      ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
        filename: 'dashboard-top.html',
        template: 'src/public/dashboard.html',
        publicPath: DEPLOY_PATH
      })] : []),
      new HtmlWebpackPlugin({
        filename: 'demo.html',
        template: 'src/public/demo.html',
        publicPath: '.',
      }),
      ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
        filename: 'demo-top.html',
        template: 'src/public/demo.html',
        publicPath: DEPLOY_PATH
      })] : []),
      new HtmlWebpackPlugin({
        filename: 'model-authoring-demo.html',
        template: 'src/public/model-authoring-demo.html',
        publicPath: '.',
      }),
      ...(DEPLOY_PATH ? [new HtmlWebpackPlugin({
        filename: 'model-authoring-demo-top.html',
        template: 'src/public/model-authoring-demo.html',
        publicPath: DEPLOY_PATH
      })] : []),
    ]
  };
};