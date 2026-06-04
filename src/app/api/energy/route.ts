import { NextResponse } from 'next/server';
import { EnergyService } from '../../../domains/energy/service';
import { HomeAssistantEnergyProvider } from '../../../integrations/home-assistant/providers/ha-energy.provider';

const energyService = new EnergyService(new HomeAssistantEnergyProvider());

export async function GET() {
  try {
    const metrics = await energyService.getCurrentMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch energy metrics' }, { status: 500 });
  }
}