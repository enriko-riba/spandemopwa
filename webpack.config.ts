import * as webpack from 'webpack';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
//const ProvidePlugin = require("webpack/lib/ProvidePlugin");
//const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isProd = (require('yargs').argv.env === 'build');

let plugins: Array<webpack.Plugin> = [
    new CleanWebpackPlugin(['public']), 
    new CopyWebpackPlugin([{from: 'src/assets/*.png', to:'assets/[name].[ext]' },
                           //{from: 'src/assets/favicon.ico', to:'assets/[name].[ext]' },
                           //{from: 'src/pwa_manifest.json', to:'[name].[ext]' },
                           //{from: 'src/sw.js', to:'[name].[ext]' }
                        ]),
    new HtmlWebpackPlugin({ template: './src/index.html',
                          production: isProd, 
                          minify: {
                              collapseWhitespace: false,
                              collapseInlineTagWhitespace: true,
                              removeComments: true,
                              removeRedundantAttributes: true
                          }}), 
                          new CommonsChunkPlugin({
                            names:["main", "vendor", "frb", "runtime"]
                          }),
                          //new ProvidePlugin({jQuery: 'jquery', $: 'jquery', jquery: 'jquery', ko: 'knockout'}),
	new ExtractTextPlugin({filename: "bundle.css", disable: false, allChunks: true}),
	//new ManifestPlugin(),
  ];


  if(isProd){
    //plugins.push( new UglifyJSPlugin({parallel: true}));
} else {
    const hot = require('webpack/lib/HotModuleReplacementPlugin');
    const nmp = require('webpack/lib/NamedModulesPlugin');
    plugins.push(
         new hot(),
         new nmp()
    );
}

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
    devtool: isProd ? false: "source-map",

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
    plugins: plugins,
    module: {
        rules: [ 
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
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
                use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: ['css-loader', 'sass-loader']
                    })
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