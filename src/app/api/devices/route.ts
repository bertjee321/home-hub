import { NextResponse } from 'next/server';
import prisma from '@/shared/db/prisma';

// GET configured devices from Prisma (for the dashboard)
export async function GET() {
  try {
    const configuredDevices = await prisma.device.findMany({
      include: { groups: true }
    });
    return NextResponse.json(configuredDevices);
  } catch (error) {
    console.error('Failed to fetch local devices:', error);
    return NextResponse.json({ error: 'Failed to fetch local devices' }, { status: 500 });
  }
}

// PUT: Save devices to Prisma (Opt-in from the Discover page)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { entityId, customName, icon, isHidden } = body;

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
    }

    const device = await prisma.device.upsert({
      where: { id: entityId },
      update: { customName, icon, isHidden: isHidden ?? false },
      create: { id: entityId, customName, icon, isHidden: isHidden ?? false },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Failed to save device to database:', error);
    return NextResponse.json({ error: 'Failed to save device to database' }, { status: 500 });
  }
}

