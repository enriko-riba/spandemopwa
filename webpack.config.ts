import * as webpack from 'webpack';
const p = require("./webpack.plugins");
const path = require('path');

interface Config extends webpack.Configuration {
    module: {
        rules: webpack.NewUseRule[]
    }
}

const config : Config = {
    entry: {
        vendor: ["knockout", "knockout-postbox", "jquery"],     // vendor libraries bundle
        frb:    ["firebase", "@firebase/firestore"],            // firebase only libraries
        main:   ["./src/main.ts"],
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].[hash:4].js'        
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: p.isProd ? false: "source-map",

    //  will be passed to webpack-dev-server (only if dev server is used)
    devServer: {
        historyApiFallback: true,
        port: 3001,
        hot: true,
        compress: false,
        stats: { colors: true },
      },

    resolve: {
        extensions: [".ts", ".js", ".css", ".sccs", ".json"]
    },
    plugins: p.plugins,
    module: {
        rules: [ 
            {
                enforce: "pre",
                test: /\.js$/,
                use: "source-map-loader"
            },
            {
                test: /\.woff2?$|\.ttf$|\.eot$/,
                use: "file-loader"
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i, 
                use: "file-loader?name=assets/[hash:4].[ext]"
            },
            {
                test:  /\.scss$/,                
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {   //  for ko html templates
                test: /\.html$/,
                use: ['raw-loader']
            }
        ]
    }
}

module.exports = config;