import * as path from 'path';
import * as webpack from 'webpack';

// import CopyPlugin from 'copy-webpack-plugin';

import {resolve_app} from './scripts/path';
// import WriteFilePlugin from 'write-file-webpack-plugin';

const package_version = require(resolve_app('package.json')).version;

export const common: webpack.Configuration = {
    devServer: {
        contentBase: path.resolve(__dirname, '..', 'public'),
        compress: false,
        port: 9000,
        hot: true,
        before: () =>
        {
            // cp.exec(`node ${path.resolve(__dirname, '..', 'server.js')}`);
        }
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            query: {transpileOnly: true}
        }]
    },
    plugins: [
        // new WriteFilePlugin(),
        // new CopyPlugin([
        //     { from: path.resolve(__dirname, '..', 'src', 'enigma.web.js') }
        //   ]),
        new webpack.EnvironmentPlugin({
            __VERSION__: `"${package_version}"`
        })
    ],
    target: 'web'
};
