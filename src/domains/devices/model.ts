export interface BaseDevice {
  id: string; // usually entity_id
  name: string;
  state: string;
  type: string;
  attributes: Record<string, any>;
}
