

module.exports = function(type, options = {}) {
    let loaders = [
        {
            loader: "css-loader",
            options: {
                modules: false,
                // localIdentName: "[name]__[local]--[hash:base64:5]"
            }
        },
        {
            loader: "postcss-loader"
        },
    ];

    if (type) {
        loaders.push({
            loader: `${type}-loader`,
            options
        });
    }

    return {
        fallback: "style-loader",
        use: loaders
    };
};
