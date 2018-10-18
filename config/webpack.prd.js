
let base = require('./webpack.base');
let merger = require('webpack-merge');
let Uglify = require('uglifyjs-webpack-plugin');

module.exports = merger(base, {
    mode: 'production',

    devtool: false,

    plugins: [
        new Uglify({
            cache: '.cache'
        })
    ]
});