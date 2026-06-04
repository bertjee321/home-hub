import { DeviceService } from "@/domains/devices/service";
import { HomeAssistantDeviceProvider } from "@/integrations/home-assistant/providers/ha-device.provider";
import { NextResponse } from "next/server";

const deviceService = new DeviceService(new HomeAssistantDeviceProvider());

export async function GET() {
  try {
    const devices = await deviceService.getAllDevices();
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Failed to fetch from HA:", error);
    return NextResponse.json(
      { error: "Failed to communicate with Home Assistant" },
      { status: 500 },
    );
  }
}