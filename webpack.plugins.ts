import * as webpack from 'webpack';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
//const ManifestPlugin = require('webpack-manifest-plugin');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isProd = (require('yargs').argv.env === 'build');

let plugins: Array<webpack.Plugin> = [
    new CleanWebpackPlugin(['public']), 
    new CopyWebpackPlugin([{from: 'src/assets/*.png', to:'assets/[name].[ext]' },
                           {from: 'src/assets/favicon.ico', to:'assets/[name].[ext]' },
                           {from: 'src/pwa_manifest.json', to:'[name].[ext]' },
                           {from: 'src/sw.js', to:'[name].[ext]' }]),
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
                          new ProvidePlugin({jQuery: 'jquery', $: 'jquery', jquery: 'jquery', ko: 'knockout'}),
	//new ExtractTextPlugin({filename: "bundle.css", disable: false, allChunks: true}),
	//new ManifestPlugin(),
  ];


  if(isProd){
    plugins.push( new UglifyJSPlugin({parallel: true}));
} else {
    const hot = require('webpack/lib/HotModuleReplacementPlugin');
    const nmp = require('webpack/lib/NamedModulesPlugin');
    plugins.push(
         new hot(),
         new nmp()
    );
}
