export interface EnergyMetrics {
  gasConsumption: number; // m3
  electricityConsumption: number; // kW
  electricityProduction: number; // kW
  electricityActiveTariff: 'tariff_1' | 'tariff_2';
  electricityConsumptionTariff1: number; // kWh
  electricityConsumptionTariff2: number; // kWh
  electricityProductionTariff1: number; // kWh
  electricityProductionTariff2: number; // kWh
}
