export class ComplianceMath {
  private static readonly TARGET_INTENSITY_2025 = 89.3368;
  private static readonly ENERGY_CONVERSION_FACTOR = 41000;

  static calculateEnergyInScope(fuelConsumption: number): number {
    return fuelConsumption * this.ENERGY_CONVERSION_FACTOR;
  }

  static calculateComplianceBalance(
    actualIntensity: number,
    fuelConsumption: number,
  ): number {
    const energyInScope = this.calculateEnergyInScope(fuelConsumption);
    return (this.TARGET_INTENSITY_2025 - actualIntensity) * energyInScope;
  }

  static calculatePercentageDifference(
    baselineIntensity: number,
    comparisonIntensity: number,
  ): number {
    return (comparisonIntensity / baselineIntensity - 1) * 100;
  }

  static isCompliant(actualIntensity: number): boolean {
    return actualIntensity <= this.TARGET_INTENSITY_2025;
  }
}
