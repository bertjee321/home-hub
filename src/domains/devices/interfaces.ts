import { BaseDevice } from './model';

export interface IDeviceProvider {
  getDevices(): Promise<BaseDevice[]>;
  getDevice(id: string): Promise<BaseDevice | null>;
  turnOn(id: string): Promise<void>;
  turnOff(id: string): Promise<void>;
}
