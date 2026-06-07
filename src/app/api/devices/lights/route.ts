import { haClient } from "@/integrations/home-assistant/client";
import { Device, MergedDevice } from "@/lib/models/device.model";
import prisma from "@/shared/db/prisma";
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  try {
    const configuredLights: Device[] = await prisma.device.findMany({
      include: { groups: true },
      where: { id: { startsWith: "light." } },
    });

    const haStates = await haClient.getStates();

    const mergedLights: MergedDevice[] = configuredLights.map((dbLight) => {
      const liveState = haStates.find((s) => s.entity_id === dbLight.id);
      return {
        ...dbLight,
        state: liveState?.state || "unavailable",
        attributes: liveState?.attributes || {},
      };
    });

    return NextResponse.json(mergedLights);
  } catch (error) {
    console.error("Failed to fetch lights:", error);
    return NextResponse.json(
      { error: "Failed to fetch lights" },
      { status: 500 },
    );
  }
}
