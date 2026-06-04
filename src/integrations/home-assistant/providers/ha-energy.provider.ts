import { IEnergyProvider } from '../../../domains/energy/interfaces';
import { EnergyMetrics } from '../../../domains/energy/model';
import { haClient } from '../client';

export class HomeAssistantEnergyProvider implements IEnergyProvider {
  // Configurable entity IDs could be moved to DB or ENV
  private gasConsumptionEntityId = process.env.HA_GAS_ENTITY_CONSUMPTION || 'sensor.gas_meter_gasverbruik'
  private electricityConsumptionEntityId = process.env.HA_ELECTRICITY_ENTITY_CONSUMPTION || 'sensor.electricity_meter_energieverbruik'
  private electricityProductionEntityId = process.env.HA_ELECTRICITY_ENTITY_PRODUCTION || 'sensor.electricity_meter_energieproductie'
  private electricityActiveTariffEntityId = process.env.HA_ELECTRICITY_ENTITY_ACTIVE_TARIFF || 'sensor.electricity_meter_actief_tarief'
  private electricityConsumptionTariff1EntityId = process.env.HA_ELECTRICITY_ENTITY_CONSUMPTION_TARIFF_1 || 'sensor.electricity_meter_energieverbruik_tarief_1'
  private electricityConsumptionTariff2EntityId = process.env.HA_ELECTRICITY_ENTITY_CONSUMPTION_TARIFF_2 || 'sensor.electricity_meter_energieverbruik_tarief_2'
  private electricityProductionTariff1EntityId = process.env.HA_ELECTRICITY_ENTITY_PRODUCTION_TARIFF_1 || 'sensor.electricity_meter_energieproductie_tarief_1'
  private electricityProductionTariff2EntityId = process.env.HA_ELECTRICITY_ENTITY_PRODUCTION_TARIFF_2 || 'sensor.electricity_meter_energieproductie_tarief_2'


  async getCurrentMetrics(): Promise<EnergyMetrics> {
    try {
      const [gc, ec, ep, eat, ect1, ect2, ept1, ept2] = await Promise.all([
        haClient.getState(this.gasConsumptionEntityId).catch(() => null),
        haClient.getState(this.electricityConsumptionEntityId).catch(() => null),
        haClient.getState(this.electricityProductionEntityId).catch(() => null),
        haClient.getState(this.electricityActiveTariffEntityId).catch(() => null),
        haClient.getState(this.electricityConsumptionTariff1EntityId).catch(() => null),
        haClient.getState(this.electricityConsumptionTariff2EntityId).catch(() => null),
        haClient.getState(this.electricityProductionTariff1EntityId).catch(() => null),
        haClient.getState(this.electricityProductionTariff2EntityId).catch(() => null),
      ]);

      return {
        gasConsumption: gc ? parseFloat(gc.state) || 0 : 0,
        electricityConsumption: ec ? parseFloat(ec.state) || 0 : 0,
        electricityProduction: ep ? parseFloat(ep.state) || 0 : 0,
        electricityActiveTariff: eat ? (eat.state as 'tariff_1' | 'tariff_2') : 'tariff_1',
        electricityConsumptionTariff1: ect1 ? parseFloat(ect1.state) || 0 : 0,
        electricityConsumptionTariff2: ect2 ? parseFloat(ect2.state) || 0 : 0,
        electricityProductionTariff1: ept1 ? parseFloat(ept1.state) || 0 : 0,
        electricityProductionTariff2: ept2 ? parseFloat(ept2.state) || 0 : 0,
      };
    } catch {
      // TODO: Better error handling and logging
      return {
        gasConsumption: 0,
        electricityConsumption: 0,
        electricityProduction: 0,
        electricityActiveTariff: 'tariff_1',
        electricityConsumptionTariff1: 0,
        electricityConsumptionTariff2: 0,
        electricityProductionTariff1: 0,
        electricityProductionTariff2: 0,
      };
    }
  }
}
