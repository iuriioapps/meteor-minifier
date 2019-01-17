import consola from 'consola';
import merge from 'merge-deep';
import configLoader from 'rc-config-loader';

const CONFIG_NAME = 'meteorminifier';

export class MinifierConfig {
    constructor() {
        const NODE_ENV = process.env.NODE_ENV || "development";

        this.config = {
            config: {
                ignorePattern: '\.min\.js$',
                terser: {
                    compress: {
                        drop_debugger: false,
                        unused: false,
                        dead_code: true,
                        global_defs: {
                            "process.env.NODE_ENV": `${NODE_ENV}`
                        }
                    }
                }
            }
        };
    }

    load() {
        const loadedConfig = configLoader(CONFIG_NAME, {
            cwd: process.cwd()
        });

        if (loadedConfig) {
            this.config = merge(
                this.config,
                loadedConfig
            );
        }

        if (this.config && this.config.filePath) {
            consola.info(`Minifier config loaded from ${this.config.filePath}`);
        } else {
            consola.warn(`Minifier config .${CONFIG_NAME}rc was not found in ${process.cwd()}. Will fallback to default built-in config`);
        }
    }

    get(name) {
        return this.config.config[name];
    }
}
