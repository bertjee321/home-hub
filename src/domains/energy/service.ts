import { IEnergyProvider } from './interfaces';
import { EnergyMetrics } from './model';
import prisma from '../../shared/db/prisma';

export class EnergyService {
  constructor(private provider: IEnergyProvider) {}

  async getCurrentMetrics(): Promise<EnergyMetrics> {
    return this.provider.getCurrentMetrics();
  }
}
