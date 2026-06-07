interface HAStateContext {
  id: string;
  parent_id: string | null;
  user_id: string | null;
}

export interface HAStateAttributes {
  friendly_name?: string;
  icon?: string;
  entity_picture?: string;
  assumed_state?: boolean;
  unit_of_measurement?: string;
  attribution?: string;
  device_class?: string;
  supported_features?: number;
  [key: string]: unknown; // allow other arbitrary attrs
}

export interface HAState {
  entity_id: string;
  state: string;
  attributes?: HAStateAttributes;
  last_changed?: string;
  last_reported?: string;
  last_updated?: string;
  context: HAStateContext;
}