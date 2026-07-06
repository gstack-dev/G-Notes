import path from 'path';
import { sources, Compilation } from 'webpack';
import type { Compiler, Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
});

class FixDirnamePlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap('FixDirnamePlugin', (compilation: Compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'FixDirnamePlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        (assets: Record<string, sources.Source>) => {
          for (const [name, asset] of Object.entries(assets)) {
            if (name.endsWith('.js')) {
              const source = asset.source();
              if (typeof source === 'string' && source.includes('__dirname')) {
                const newSource = (source as string).replace(
                  /__dirname\s*\+\s*["']\/native_modules\/["']/g,
                  '"" + "/native_modules/"',
                );
                compilation.updateAsset(
                  name,
                  new sources.RawSource(newSource, false),
                );
              }
            }
          }
        },
      );
    });
  }
}

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new FixDirnamePlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      "@": path.resolve(__dirname, 'src'),
    },
  },
};
