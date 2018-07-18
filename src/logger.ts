import * as config from './config';
const pad = require('left-pad')

export class Logger {
    private _debugValues = new Map<string, number>();

    debug(...args: any[]) {
        if (config.debug) {
            console.log(...args);
        }
    }

    log(...args: any[]) {
        console.log(...args);
    }

    error(...args: any[]) {
        console.error(...args);
    }

    setDebugValue(name: string, value: number) {
        this._debugValues.set(name, value);
    }

    printDebugValues() {
        const entries = Array.from(this._debugValues.entries()).map(([key, value]) => {
            return `${key}: ${pad(value.toFixed(3), 5)}`;
        })
        this.debug(entries.join('  |  '));
    }
}

