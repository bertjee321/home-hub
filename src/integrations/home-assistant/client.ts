export class HomeAssistantClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.HA_URL || 'http://localhost:8123';
    this.token = process.env.HA_TOKEN || '';
  }

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
