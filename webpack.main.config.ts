import path from 'path';
import type { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  entry: './src/index.ts',
  module: {
    rules: [
      ...rules,
      {
        test: /[/\\]sql\.js[/\\]dist[/\\]sql-wasm\.js$/,
        use: path.resolve(__dirname, 'scripts/sqljs-patch-loader.js'),
      },
    ],
  },
  plugins: [
    ...plugins,
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'),
          to: 'sql-wasm.wasm',
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
