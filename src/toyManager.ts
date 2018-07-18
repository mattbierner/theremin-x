import * as noble from 'noble';
import { Logger } from './logger';
import { StreamingValue } from './StreamingValue';
import { getConnectionForLocalName, Toy } from './toy';

/**
 * Discovers and manages toys.
 */
export class ToyManager {
    private readonly _devices = new Map<string, Toy>();

    constructor(
        private readonly _strengthInput: StreamingValue,
        private readonly _logger: Logger
    ) {
        noble.on('discover', peripheral => this.onDiscoverPeripheral(peripheral));

        noble.on('stateChange', state => {
            if (state === 'poweredOn') {
                noble.startScanning([], false, console.error);
            } else {
                noble.stopScanning();
            }
        });
    }

    private get numberConnected() {
        return this._devices.size;
    }

    private onDiscoverPeripheral(peripheral: noble.Peripheral) {
        const localName = peripheral.advertisement.localName;
        const connectionInfo = getConnectionForLocalName(localName);
        if (!connectionInfo) {
            return;
        }

        this._logger.debug(`===== Discoverred (${localName}) =====`, );

        const uuid = peripheral.uuid;
        this._devices.set(uuid, new Toy(connectionInfo, peripheral, this._strengthInput, this._logger));

        this._logger.setDebugValue('Connected', this.numberConnected);

        peripheral.on('disconnect', () => {
            this._logger.debug(`===== Diconnected (${localName}) =====`);
            this._devices.delete(uuid);
            this._logger.setDebugValue('Connected', this.numberConnected);
        })
    }
}
