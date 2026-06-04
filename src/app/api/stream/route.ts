import { haClient } from '@/integrations/home-assistant/client';
import prisma from '@/shared/db/prisma';

// Ensure the singleton client connects if not already
// Note: In Next.js dev mode, HMR may cause this to connect multiple times.
// In production it will be a true singleton.
haClient.connect();

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connected message so the client knows we're alive
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      const handleStateChange = async (data: any) => {
        const { entity_id, new_state } = data;

        // "Soft Management" pattern:
        // We only care about it if it exists in our Prisma database
        const dbDevice = await prisma.device.findUnique({
          where: { id: entity_id },
        });

        // If it's not in the DB, or marked as hidden, just drop the event!
        if (!dbDevice || dbDevice.isHidden) {
          return; 
        }

        // Augment state with Prisma custom data
        const augmentedEvent = {
          entityId: entity_id,
          state: new_state.state,
          attributes: new_state.attributes,
          customName: dbDevice.customName || new_state.attributes.friendly_name,
          icon: dbDevice.icon,
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'update', data: augmentedEvent })}\n\n`)
        );
      };

      haClient.on('ha_state_changed', handleStateChange);

      // Clean up the listener when the client disconnects
      request.signal.addEventListener('abort', () => {
        haClient.off('ha_state_changed', handleStateChange);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
