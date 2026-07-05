import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './screen',
    name: 'G-Notes',
    executableName: 'g-notes',
    ...(process.env.CSC_LINK ? {
      certificateFile: process.env.CSC_LINK,
      certificatePassword: process.env.CSC_KEY_PASSWORD,
    } : {}),
    ...(process.env.APPLE_IDENTITY && process.env.APPLE_ID && process.env.APPLE_ID_PASSWORD ? {
      osxSign: {
        identity: process.env.APPLE_IDENTITY,
        hardenedRuntime: true,
        gatekeeperAssess: false,
      },
      osxNotarize: {
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        teamId: process.env.APPLE_TEAM_ID,
      },
    } : {}),
  },
  makers: [
    new MakerSquirrel({
      name: 'G-Notes',
      setupIcon: './screen.ico',
      ...(process.env.CSC_LINK ? {
        signWithParams: `/a /fd SHA256 /f "${process.env.CSC_LINK}" /p "${process.env.CSC_KEY_PASSWORD}" /tr http://timestamp.digicert.com /td SHA256`,
      } : {}),
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        name: 'g-notes',
        productName: 'G-Notes',
        homepage: 'https://github.com/gstack-dev/G-Notes',
      },
    }),
    new MakerDeb({
      options: {
        name: 'g-notes',
        productName: 'G-Notes',
        homepage: 'https://github.com/gstack-dev/G-Notes',
      },
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'gstack-dev',
          name: 'g-notes',
        },
        draft: true,
        prerelease: false,
      },
    },
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
