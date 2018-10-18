
let base = require('./webpack.base');
let merger = require('webpack-merge');

module.exports = merger(base, {
    mode: 'development',

    devtool: '#source-map',

    devServer: {
        contentBase: './dist', //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        inline: true,
        hot: true,
        port: 9494,
        open: true,
        openPage: './index.html',
        host: '192.168.8.192'
        // host: 'localhost'
    }
});