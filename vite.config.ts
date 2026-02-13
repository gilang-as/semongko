import { defineConfig } from 'vite';
import { obfuscator } from 'rollup-obfuscator';
import type { Plugin } from 'vite';

// Get current year for copyright
const currentYear = new Date().getFullYear();

// Banner text for JS and CSS
const banner = `/*!
 * Semongko - Watermelon Merging Game
 * Version: 1.0.0
 * Copyright (c) ${currentYear}
 * Licensed under MIT License
 * 
 * Repository: https://github.com/gilang-as/semongko
 * Built with: Vite + TypeScript + Matter.js
 * Build Date: ${new Date().toISOString()}
 */`;

// Plugin to add banner to CSS files
const cssBannerPlugin = (): Plugin => {
  return {
    name: 'css-banner',
    generateBundle(_, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          chunk.source = banner + '\n' + chunk.source;
        }
      }
    }
  };
};

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].min.js',
        chunkFileNames: 'assets/[name].min.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/style.min.css';
          }
          return 'assets/[name].[ext]';
        }
      },
      plugins: [
        cssBannerPlugin(),
        obfuscator({
          // Obfuscator options
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: false,
          debugProtectionInterval: 0,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: true,
          simplify: true,
          splitStrings: true,
          splitStringsChunkLength: 10,
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayEncoding: ['base64'],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 2,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 4,
          stringArrayWrappersType: 'variable',
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        })
      ]
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        preamble: banner,
        comments: false
      }
    }
  }
});
