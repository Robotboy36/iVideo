
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const styleLoader = require('./style-loader');


function resolve (p) {
    return path.join(__dirname, '../', p);
}


module.exports = {
        entry: {
            'video.min': resolve('src/app.js'),
            'index': resolve('src/index.js'),
        },

        output: {
            path: resolve('dist'),
            filename: 'js/[name].js'
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader'
                    },
                    exclude: /node_modules/
                }, {
                    test: /\.scss$/,
                    use: styleLoader('sass', {
                        outputStyle: 'extanded'
                    })
                }, {
                    test: /\.css$/,
                    use: styleLoader()
                }, {
                    test: /\.(png|gif|svg|jpe?g)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 1048,
                            publicPath: '../',
                            name: 'imgs/[name].[ext]'
                        }
                    }
                }, {
                    test: /\.mp4$/i,
                    use: {
                        loader: 'file-loader',
                        options: {
                            publicPath: '../',
                            name: 'media/[name].[ext]'
                        }
                    }
                }
            ]
        },

        plugins: [
            new webpack.BannerPlugin('版权所有，翻版必究'),
            new HtmlWebpackPlugin({
                template: resolve('index.html'),
                filename: 'index.html',
                inject: true
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            // new ExtractTextPlugin('css/video.css'),
            // new CopyWebpackPlugin([
            //     {from: './static', to: './'}
            // ])
        ]
};