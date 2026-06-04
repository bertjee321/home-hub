import { NextResponse } from 'next/server';
import { DeviceService } from '../../../domains/devices/service';
import { HomeAssistantDeviceProvider } from '../../../integrations/home-assistant/providers/ha-device.provider';

const deviceService = new DeviceService(new HomeAssistantDeviceProvider());

export async function GET() {
  try {
    const devices = await deviceService.getAllDevices();
    return NextResponse.json(devices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing action or id' }, { status: 400 });
    }

    if (action === 'turn_on') {
      await deviceService.turnOnDevice(id);
    } else if (action === 'turn_off') {
      await deviceService.turnOffDevice(id);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 });
  }
}
