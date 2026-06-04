import { NextResponse } from 'next/server';
import prisma from '@/shared/db/prisma';
import { haClient } from '@/integrations/home-assistant/client';

// GET configured devices from Prisma and merge with their current HA state
export async function GET() {
  try {
    const configuredDevices = await prisma.device.findMany({
      include: { groups: true }
    });

    // Fetch the live states from HA to overlay onto our Prisma config
    const haStates = await haClient.getStates();

    const mergedDevices = configuredDevices.map(dbDevice => {
      const liveState = haStates.find((s: any) => s.entity_id === dbDevice.id);
      return {
        ...dbDevice,
        state: liveState?.state || 'unavailable',
        attributes: liveState?.attributes || {}
      };
    });

    return NextResponse.json(mergedDevices);
  } catch (error) {
    console.error('Failed to fetch local devices:', error);
    return NextResponse.json({ error: 'Failed to fetch local devices' }, { status: 500 });
  }
}

// PUT: Save devices to Prisma (Opt-in from the Discover page)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { entityId, customName, icon, isHidden, groupId } = body;

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
    }

    const device = await prisma.device.upsert({
      where: { id: entityId },
      update: { 
        customName, 
        icon, 
        isHidden: isHidden ?? false,
        // If a groupId is provided, set it (replacing old ones). 
        // If it's "clear", remove all groups. Otherwise do nothing.
        ...(groupId === 'clear' 
             ? { groups: { set: [] } } 
             : groupId 
                 ? { groups: { set: [{ id: groupId }] } } 
                 : {})
      },
      create: { 
        id: entityId, 
        customName, 
        icon, 
        isHidden: isHidden ?? false,
        ...(groupId && groupId !== 'clear' ? { groups: { connect: { id: groupId } } } : {})
      },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Failed to save device to database:', error);
    return NextResponse.json({ error: 'Failed to save device to database' }, { status: 500 });
  }
}

// DELETE: Remove a configured device from Prisma
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const entityId = url.searchParams.get('entityId');

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
    }

    await prisma.device.delete({
      where: { id: entityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove device from database:', error);
    return NextResponse.json({ error: 'Failed to remove device' }, { status: 500 });
  }
}

