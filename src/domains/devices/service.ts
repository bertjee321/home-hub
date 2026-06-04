import { IDeviceProvider } from './interfaces';
import { BaseDevice } from './model';

export class DeviceService {
  constructor(private provider: IDeviceProvider) {}

  async getAllDevices(): Promise<BaseDevice[]> {
    return this.provider.getDevices();
  }

  async getDeviceById(id: string): Promise<BaseDevice | null> {
    return this.provider.getDevice(id);
  }

  async turnOnDevice(id: string): Promise<void> {
    return this.provider.turnOn(id);
  }

  async turnOffDevice(id: string): Promise<void> {
    return this.provider.turnOff(id);
  }
}
