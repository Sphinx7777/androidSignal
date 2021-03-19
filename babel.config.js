module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['.'],
                alias: {
                    src: './src',
                    'wavesurfer.js': './wavesurfer.js',
                },
                extensions: [
                    '.wasm',
                    '.mjs',
                    '.js',
                    '.jsx',
                    '.json',
                    '.ts',
                    '.tsx',
                ],
                cwd: 'babelrc',
            },
        ],
        ['@babel/plugin-proposal-decorators', {legacy: true}],
        'transform-class-properties',
        [
            'import',
            {
                libraryName: 'antd',
                style: 'css',
            },
        ],
    ],
};
