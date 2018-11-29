/* global __dirname, require, module */

// const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const env = require('yargs').argv.env // use --env with webpack 2
const pkg = require('./package.json')

let libraryName = pkg.name

let outputFile, mode

if (env === 'build') {
  mode = 'production'
  outputFile = libraryName + '.min.js'
} else {
  mode = 'development'
  outputFile = libraryName + '.js'
}

const config = {
  mode: mode,
  entry: [
    'babel-polyfill',
    path.join(__dirname, '/src/index.js')
  ],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    symlinks: false,
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'src')
    ],
    extensions: ['.json', '.js']
  }
}

// function findLinkedModules (nodeModulesPath) {
//   const modules = []

//   fs.readdirSync(nodeModulesPath).forEach(dirname => {
//     const modulePath = path.resolve(nodeModulesPath, dirname)
//     const stat = fs.lstatSync(modulePath)

//     if (dirname.startsWith('.')) {
//       // not a module or scope, ignore
//     } else if (dirname.startsWith('@')) {
//       // scoped modules
//       modules.push(...findLinkedModules(modulePath))
//     } else if (stat.isSymbolicLink()) {
//       const realPath = fs.realpathSync(modulePath)
//       const realModulePath = path.resolve(realPath, 'node_modules')

//       modules.push(realModulePath)
//     }
//   })

//   return modules
// }

module.exports = config
