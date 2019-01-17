import { Minifier } from "./impl/minifier";

Npm.require('app-module-path/cwd');

Plugin.registerMinifier(
    {
        extensions: ['js'],
        archMatching: 'web'
    },
    () => {
        return new Minifier();
    });
