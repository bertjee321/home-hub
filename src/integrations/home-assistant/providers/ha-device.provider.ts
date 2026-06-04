import { IDeviceProvider } from "../../../domains/devices/interfaces";
import { BaseDevice } from "../../../domains/devices/model";
import { haClient } from "../client";

export class HomeAssistantDeviceProvider implements IDeviceProvider {
  private mapStateToDevice(stateObj: any): BaseDevice {
    const domain = stateObj.entity_id.split(".")[0];
    let type: BaseDevice["type"] = "unknown";

    if (domain === "light") type = "light";
    else if (domain === "switch") type = "switch";
    else if (domain === "sensor") type = "sensor";

    return {
      id: stateObj.entity_id,
      name: stateObj.attributes.friendly_name || stateObj.entity_id,
      state: stateObj.state,
      type,
      attributes: stateObj.attributes,
    };
  }

  async getDevices(): Promise<BaseDevice[]> {
    const states = await haClient.getStates();

    // Filter just to some basic editable domains for devices
    return states
      .filter((s: any) =>
        ["light", "switch"].includes(s.entity_id.split(".")[0]),
      )
      .map(this.mapStateToDevice);
  }

  async getDevice(id: string): Promise<BaseDevice | null> {
    try {
      const state = await haClient.getState(id);
      return this.mapStateToDevice(state);
    } catch {
      return null;
    }
  }

  async turnOn(id: string): Promise<void> {
    const domain = id.split(".")[0];
    await haClient.callService(domain, "turn_on", { entity_id: id });
  }

  async turnOff(id: string): Promise<void> {
    const domain = id.split(".")[0];
    await haClient.callService(domain, "turn_off", { entity_id: id });
  }
}
