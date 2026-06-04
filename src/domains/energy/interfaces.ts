import { EnergyMetrics } from './model';

export interface IEnergyProvider {
  getCurrentMetrics(): Promise<EnergyMetrics>;
}
