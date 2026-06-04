import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const { HomeAssistantClient } = await import('./src/integrations/home-assistant/client');
  const client = new HomeAssistantClient();
  console.log("Starting WebSocket Test...");
  client.connect();

  // Keep process alive
  setInterval(() => {}, 1000);
}

run();
