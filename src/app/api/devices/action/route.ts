import { NextResponse } from 'next/server';
import { haClient } from '@/integrations/home-assistant/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entityId, action } = body;

    if (!entityId || !action) {
      return NextResponse.json({ error: 'Missing entityId or action' }, { status: 400 });
    }

    const domain = entityId.split('.')[0];
    
    // We only support lights and switches for this basic toggle for now
    if (domain !== 'light' && domain !== 'switch') {
       return NextResponse.json({ error: 'Domain not supported for toggling' }, { status: 400 });
    }

    await haClient.callService(domain, action, { entity_id: entityId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error executing action:', error);
    return NextResponse.json({ error: 'Failed to execute action' }, { status: 500 });
  }
}
