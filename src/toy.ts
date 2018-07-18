import { Buffer } from 'buffer';
import * as noble from 'noble';
import { Logger } from './logger';
import { StreamingValue } from './StreamingValue';

export enum ToyType {
    hush,
    lush,
    ambi
}

export interface ToyConnectionInfo {
    readonly type: ToyType;
    readonly localname: string;
    readonly serviceUuid: string;
    readonly transmitCharacteristicUUID: string;
    readonly receiveCharacteristicUUID: string;
}

const hush: ToyConnectionInfo = {
    type: ToyType.hush,
    localname: 'LVS-Z001',
    serviceUuid: '6e400001b5a3f393e0a9e50e24dcca9e',
    transmitCharacteristicUUID: '6e400002b5a3f393e0a9e50e24dcca9e',
    receiveCharacteristicUUID: '6e400003b5a3f393e0a9e50e24dcca9e',
};

const lush: ToyConnectionInfo = {
    type: ToyType.lush,
    localname: 'LVS-Lush40',
    serviceUuid: '5330000100234bd4bbd5a6920e4c5653',
    transmitCharacteristicUUID: '5330000200234bd4bbd5a6920e4c5653',
    receiveCharacteristicUUID: '5330000300234bd4bbd5a6920e4c5653',
};

const ambi: ToyConnectionInfo = {
    type: ToyType.ambi,
    localname: 'LVS-L009',
    serviceUuid: 'fff0',
    transmitCharacteristicUUID: 'fff2',
    receiveCharacteristicUUID: 'fff1',
};

const allToys = [hush, lush, ambi];

export const getConnectionForLocalName = (localname: string): ToyConnectionInfo | undefined =>
    allToys.find(toy => toy.localname === localname);


export class Toy {
    private receiveCharacteristic?: noble.Characteristic;
    private transmitCharacteristic?: noble.Characteristic;

    constructor(
        connectionInfo: ToyConnectionInfo,
        peripheral: noble.Peripheral,
        private readonly _input: StreamingValue,
        private readonly _logger: Logger,
    ) {

        peripheral.connect(error => {
            if (error) {
                _logger.error('Vibe init error', error);
                return;
            }

            peripheral.discoverServices([], (err, services) => {
                services[0].discoverCharacteristics([], (err, characteristics) => {
                    for (const characteristic of characteristics) {
                        if (characteristic.uuid === connectionInfo.transmitCharacteristicUUID) {
                            this.transmitCharacteristic = characteristic
                        } else if (characteristic.uuid === connectionInfo.receiveCharacteristicUUID) {
                            this.receiveCharacteristic = characteristic
                        }
                    }
                    this.ready()
                });
            });
        });
    }

    private ready(): any {
        if (!this.transmitCharacteristic || !this.receiveCharacteristic) {
            return
        }

        this.receiveCharacteristic.subscribe(_error => {
            // Ping on connected
            this.write(1);
            setTimeout(() => {
                this.receiveCharacteristic!.on('data', (_data: string) => this.doUpdate());
                this.write(0);
            }, 500);
        })
    }

    private doUpdate() {
        this.write(this.strength);
    }

    private write(strength: number) {
        if (!this.transmitCharacteristic || !this.receiveCharacteristic) {
            return;
        }

        this.transmitCharacteristic.write(Buffer.from(`Vibrate:${strength};`, 'utf8'), false, (error) => {
            if (error) {
                this._logger.error(error);
            }
        });
    }

    private get strength() {
        return Math.floor(this._input.value * 20);
    }
}

