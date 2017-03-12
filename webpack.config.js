var path = require('path');
var webpack = require('webpack');
var version = require('./package.json').version;

module.exports = {
	entry: {
		resize: './src/index.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		library: 'ImgResize',
		libraryTarget: 'umd',
		filename: '[name].min.js'
	},
	module: {
    loaders: [{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/
			}]
  },
	resolve: {
		extensions: ['', '.js'],
		fallback: [path.join(__dirname, '../node_modules')]
	},
	resolveLoader: {
		root: path.join(__dirname, 'node_modules')
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
		new webpack.DefinePlugin({
			__VERSION__: JSON.stringify(version)
		})
	]
};