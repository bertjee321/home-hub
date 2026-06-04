export interface BaseDevice {
  id: string; // usually entity_id
  name: string;
  state: string;
  type: 'light' | 'switch' | 'sensor' | 'unknown';
  attributes: Record<string, any>;
}
