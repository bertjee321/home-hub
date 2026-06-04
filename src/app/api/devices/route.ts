import { NextResponse } from 'next/server';
import prisma from '@/shared/db/prisma';
import { haClient } from '@/integrations/home-assistant/client'; // Keep this for now for the action POST
import { DeviceService } from '@/domains/devices/service';
import { HomeAssistantDeviceProvider } from '@/integrations/home-assistant/providers/ha-device.provider';

const deviceService = new DeviceService(new HomeAssistantDeviceProvider());

