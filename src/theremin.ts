const midi = require('midi')
import * as config from './config';
import { Logger } from './logger';
import { AveragedValueOverTime, ClampedValue, SimpleValue, StreamingValue } from './streamingValue';

/**
 * Samples pitch and volumn from a midi theremin.
 */
export class Theremin {
    private readonly _input: any;

    private _volume = new SimpleValue(0);
    private _pitch = new SimpleValue(0);

    public readonly volume: StreamingValue =
        new ClampedValue(
            new AveragedValueOverTime(this._volume, 10, 4),
            config.volumeMin,
            config.volumeMax);

    public readonly pitch: StreamingValue =
        new ClampedValue(
            new AveragedValueOverTime(this._pitch, 10, 4),
            config.pitchMin,
            config.pitchMax);

    constructor(
        private readonly _logger: Logger
    ) {
        this._input = new midi.input();
        this._input.getPortCount()
        this._input.on('message', this.onMidiMessage.bind(this));
        this._input.openPort(0);
        this._input.ignoreTypes(false, false, false);
    }

    private onMidiMessage(_deltaTime: number, message: number[]) {
        if (message[0] !== 176) {
            return;
        }

        switch (message[1]) {
            case config.pitchChannel:
                this._pitch.value = message[2];
                break;

            case config.volumeChannel:
                this._volume.value = message[2];
                break;

            default:
                this._logger.error(`Unexpected message: ${message}`);
        }
    }
}
