import easing from "./easing";
import { Logger } from "./logger";
import { StreamingValue } from "./StreamingValue";
import { Theremin } from "./theremin";
const pad = require('left-pad')

export class ThereminSampler implements StreamingValue {
    private readonly _rate = 30;

    private _decayRate = 0;

    private _values: number[] = [];
    private _avgSize = 3;
    private _lastPitch = 0;

    private _connected: number = 0;

    constructor(
        private readonly theremin: Theremin,
        private readonly _logger: Logger
    ) {
        setInterval(() => {
            const pitch = this.theremin.pitch.value;
            const volume = this.theremin.volume.value;

            // A bunch of magic :)

            const pitchDelta = Math.abs(pitch - this._lastPitch);
            this._lastPitch = pitch;

            this._decayRate += pitchDelta * 0.5;
            this._decayRate *= 0.975;

            this._decayRate = Math.max(0, Math.min(1, this._decayRate));

            let value = Math.max(0, Math.min(1,
                (this.getBase(pitch) + this._decayRate * 0.8 * (volume / 0.5 + 0.5)) * easing.easeInOutQuad(volume)));

            this._values.unshift(value);
            while (this._values.length > this._avgSize) {
                this._values.pop();
            }

            this._logger.setDebugValue('Value', this.value);
            this._logger.setDebugValue('Pitch', theremin.pitch.value);
            this._logger.setDebugValue('Volume', theremin.volume.value);
            this._logger.setDebugValue('Decay', this._decayRate);
            this._logger.printDebugValues();
        }, this._rate);
    }

    get value(): number {
        const sum = this._values.reduce((sum, x) => sum + x, 0);
        return sum / this._values.length;
    }

    private getBase(pitch: number) {
        return (easing.easeInOutQuad(pitch) * 0.7 + 0.05);
    }
}