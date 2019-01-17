import consola from 'consola';
import terser from 'terser';

export class TerserMinifier {
    constructor(options) {
        this.options = options;
    }

    minify(source) {
        if (!this.options) {
            consola.fatal('Terser config missing');
            throw new Error('Terser config was not specified');
        }

        const result = {};

        try {
            const terserResult = terser.minify(source, this.options);

            if (typeof terserResult.code === "string") {
                result.code = terserResult.code;
                result.minifier = 'terser';
            } else {
                throw terserResult.error ||
                new Error("unknown terser.minify failure");
            }

        } catch (e) {
            // Although Babel.minify can handle a wider variety of ECMAScript
            // 2015+ syntax, it is substantially slower than UglifyJS/terser, so
            // we use it only as a fallback.
            var options = Babel.getMinifierOptions({
                inlineNodeEnv: process.env.NODE_ENV || "development"
            });
            result.code = Babel.minify(source, options).code;
            result.minifier = 'babel-minify';
        }

        return result;
    }
}
