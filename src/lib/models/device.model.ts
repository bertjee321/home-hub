import { HAStateAttributes } from "./home-assistant-state.model";

export interface Device {
  groups: { id: string; icon: string | null; name: string; sortOrder: number }[];
  id: string;
  customName: string | null;
  icon: string | null;
  isHidden: boolean;
}

export interface MergedDevice extends Device {
  state: string;
  attributes: HAStateAttributes;
}