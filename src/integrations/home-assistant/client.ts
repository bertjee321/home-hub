import WebSocket from 'ws';

export class HomeAssistantClient {
  private baseUrl: string;
  private wsUrl: string;
  private token: string;
  private ws: WebSocket | null = null;
  private messageId = 1;

  constructor() {
    this.baseUrl = process.env.HA_URL || 'http://localhost:8123';
    // Convert http:// down to ws:// 
    this.wsUrl = this.baseUrl.replace(/^http/, 'ws') + '/api/websocket';
    this.token = process.env.HA_TOKEN || '';
  }

  // ==== WebSocket Real-Time Connection ====

  connect() {
    console.log(`[HA Client] Connecting to WebSocket: ${this.wsUrl}`);
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      console.log('[HA Client] WebSocket connection opened.');
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      // Step 1: Handle authentication
      if (message.type === 'auth_required') {
        console.log('[HA Client] Auth required, sending token...');
        this.ws?.send(JSON.stringify({ type: 'auth', access_token: this.token }));
      }
      
      else if (message.type === 'auth_invalid') {
        console.error('[HA Client] Authentication failed: invalid token.');
      }
      
      else if (message.type === 'auth_ok') {
        console.log('[HA Client] Authentication successful!');
        this.subscribeToEvents();
      }
      
      // Step 2: Handle incoming events
      else {
        // Just log the message so we can understand the structure!
        console.log('[HA Client] Received message:', JSON.stringify(message, null, 2));
      }
    });

    this.ws.on('close', () => {
      console.log('[HA Client] WebSocket closed, retrying in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    });

    this.ws.on('error', (err) => {
      console.error('[HA Client] WebSocket error:', err.message);
    });
  }

  private subscribeToEvents() {
    // We subscribe to 'state_changed' events specifically to see device updates
    const subscribeMsg = {
      id: this.messageId++,
      type: 'subscribe_events',
      event_type: 'state_changed'
    };
    console.log('[HA Client] Subscribing to state_changed events...');
    this.ws?.send(JSON.stringify(subscribeMsg));
  }

  // ==== Standard REST Methods ====

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HA API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getStates() {
    return this.fetch<any[]>('/api/states');
  }

  async getState(entityId: string) {
    return this.fetch<any>(`/api/states/${entityId}`);
  }

  async callService(domain: string, service: string, serviceData: Record<string, any> = {}) {
    return this.fetch<any[]>(`/api/services/${domain}/${service}`, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }
}

export const haClient = new HomeAssistantClient();
