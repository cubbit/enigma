import * as webpack from 'webpack';
import merge from 'webpack-merge';

import {resolve_app} from './scripts/path';
import {common} from './webpack.common';

const NODE_ENV = process.env.NODE_ENV || 'production';

const client: webpack.Configuration = {
    // @ts-ignore
    mode: NODE_ENV,
    target: 'web',
    devtool: 'cheap-module-source-map',
    entry: [
        resolve_app('./src/index')
    ],
    output: {
        path: resolve_app('./public'),
        filename: 'index.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV,
            __IS_BROWSER__: 'true',
            __ENVIRONMENT__: `"${NODE_ENV}"`
        }),
    ]
};

export default merge(common, client);
