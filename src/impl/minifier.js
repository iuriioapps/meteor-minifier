import consola from 'consola';

import { MinifierConfig } from './minifier-config';
import { TerserMinifier } from './terser-minifier';

import { extractModuleSizesTree } from './stats';

export class Minifier {
    processFilesForBundle(files, options) {
        const { minifyMode } = options;

        const config = new MinifierConfig();
        config.load();

        if (minifyMode === 'development') {
            files.forEach(file => {
                file.addJavaScript({
                    data: file.getContentsAsBuffer(),
                    sourceMap: file.getSourceMap(),
                    path: file.getPathInBundle(),
                });
            });
            return;
        }

        consola.info('\uD83D\uDC2C Started minification');
        const terserMinifier = new TerserMinifier(config.get('terser'));

        const result = {
            data: '',
            stats: {}
        };

        const ignore = new RegExp(config.get('ignorePattern'));
        files.forEach(file => {
            const filePathInBundle = file.getPathInBundle();
            const fileContent = file.getContentsAsString();

            if (ignore.test(filePathInBundle)) {
                result.data += `${fileContent}\n\n`;
                return;
            }

            let minified;
            try {
                minified = terserMinifier.minify(fileContent);
                if (!(minified && typeof minified.code === "string")) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error();
                }
            } catch (e) {
                this.maybeThrowMinifyErrorBySourceFile(e, file);

                e.message = `${e.message} while minifying ${filePathInBundle}`;
                throw e;
            }

            const tree = extractModuleSizesTree(minified.code);

            const minifiedCodeLength = Buffer.byteLength(minified.code);
            result.stats[filePathInBundle] = tree
                ? [minifiedCodeLength, tree]
                : minifiedCodeLength;

            result.data += `${minified.code}\n\n`;
            Plugin.nudge();
        });

        if (files.length) {
            files[0].addJavaScript(result);
        }


    }

    maybeThrowMinifyErrorBySourceFile(error, file) {
        const minifierErrorRegex = /^(.*?)\s?\((\d+):(\d+)\)$/;
        const parseError = minifierErrorRegex.exec(error.message);

        if (!parseError) {
            // If we were unable to parse it, just let the usual error handling work.
            return;
        }

        const lineErrorMessage = parseError[1];
        const lineErrorLineNumber = parseError[2];

        const parseErrorContentIndex = lineErrorLineNumber - 1;

        // Unlikely, since we have a multi-line fixed header in this file.
        if (parseErrorContentIndex < 0) {
            return;
        }

        /*
        What we're parsing looks like this:
        /////////////////////////////////////////
        //                                     //
        // path/to/file.js                     //
        //                                     //
        /////////////////////////////////////////
                                               // 1
           var illegalECMAScript = true;       // 2
                                               // 3
        /////////////////////////////////////////
        Btw, the above code is intentionally not newer ECMAScript so
        we don't break ourselves.
        */

        const contents = file.getContentsAsString().split(/\n/);
        const lineContent = contents[parseErrorContentIndex];

        // Try to grab the line number, which sometimes doesn't exist on
        // line, abnormally-long lines in a larger block.
        const lineSrcLineParts = /^(.*?)(?:\s*\/\/ (\d+))?$/.exec(lineContent);

        // The line didn't match at all?  Let's just not try.
        if (!lineSrcLineParts) {
            return;
        }

        const lineSrcLineContent = lineSrcLineParts[1];
        const lineSrcLineNumber = lineSrcLineParts[2];

        // Count backward from the failed line to find the filename.
        for (let c = parseErrorContentIndex - 1; c >= 0; c--) {
            const sourceLine = contents[c];

            // If the line is a boatload of slashes, we're in the right place.
            if (!/^\/\/\/{6,}$/.test(sourceLine)) {
                continue;
            }

            // So in that case, 2 lines back is the file path.
            if (contents[c - 4] !== sourceLine) {
                continue;
            }

            const parseErrorPath = contents[c - 2]
                .substring(3)
                .replace(/\s+\/\//, "");

            const errorMessage = `Babili minification error within ${file.getPathInBundle()}:\n
                ${parseErrorPath} ${(lineSrcLineNumber
                ? ', line ' + lineSrcLineNumber
                : '')} + "\n
                ${lineErrorMessage}:\n
                ${lineSrcLineContent}\n`;

            consola.fatal(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
