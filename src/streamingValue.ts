export interface StreamingValue {
    readonly value: number;
}

export class SimpleValue implements StreamingValue {
    private _value: number

    constructor(
        initial: number
    ) {
        this._value = initial
    }

    public get value() {
        return this._value;
    }

    public set value(value: number) {
        this._value = value
    }
}

/**
 * Streaming value clamped to between `_min` and `_max`
 */
export class ClampedValue implements StreamingValue {
    constructor(
        private readonly _value: StreamingValue,
        private readonly _min: number,
        private readonly _max: number
    ) { }

    public get value() {
        const sample = (this._value.value - this._min) / (this._max - this._min)
        return Math.max(0, Math.min(1, sample));
    }
}

/**
 * Reads values from `_input` every `_rate` ms.
 * 
 * Result is the average.
 */
export class AveragedValueOverTime implements StreamingValue {
    private readonly _buffer: number[] = [];

    constructor(
        private readonly _input: StreamingValue,
        private readonly _rate: number,
        private readonly _bufferSize: number
    ) {
        setInterval(() => {
            while (this._buffer.length > this._bufferSize) {
                this._buffer.shift();
            }
            this._buffer.push(this._input.value);
        }, this._rate);
    }

    public get value() {
        const sum = this._buffer.reduce((sum, x) => sum + x, 0);
        return sum / this._buffer.length;
    }
}