Package.describe({
    name: 'ioapps:meteor-minifier',
    version: '1.0.0',
    summary: '[BETA] Meteor minifier alternative',
    git: 'https://github.com/iuriioapps/meteor-minifier',
    documentation: 'README.md'
});

Package.registerBuildPlugin({
    name: "meteor-minifier",
    use: [
        'babel-compiler@7.2.4',
        'ecmascript@0.12.4'
    ],
    npmDependencies: {
        'terser': '3.14.1',
        'rc-config-loader': '2.0.2',
        'app-module-path': '2.2.0',
        'consola': '2.3.2',
        'merge-deep': '3.0.2'
    },
    sources: [
        'src/meteor-minifier.js',
        'src/impl/minifier.js',
        'src/impl/terser-minifier.js',
        'src/impl/minifier-config.js',
        'src/impl/stats.js',
    ],
});

Package.onUse(function(api) {
    api.versionsFrom('1.8.0.2');
    api.use('isobuild:minifier-plugin@1.0.0');
});
