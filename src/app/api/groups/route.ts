import { NextResponse } from 'next/server';
import prisma from '@/shared/db/prisma';

export async function GET() {
  try {
    const groups = await prisma.deviceGroup.findMany({
      include: { devices: true },
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, icon } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const group = await prisma.deviceGroup.create({
      data: {
        name,
        icon,
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Failed to create group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
