"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceMath = void 0;
class ComplianceMath {
    static TARGET_INTENSITY_2025 = 89.3368;
    static ENERGY_CONVERSION_FACTOR = 41000;
    static calculateEnergyInScope(fuelConsumption) {
        return fuelConsumption * this.ENERGY_CONVERSION_FACTOR;
    }
    static calculateComplianceBalance(actualIntensity, fuelConsumption) {
        const energyInScope = this.calculateEnergyInScope(fuelConsumption);
        return (this.TARGET_INTENSITY_2025 - actualIntensity) * energyInScope;
    }
    static calculatePercentageDifference(baselineIntensity, comparisonIntensity) {
        return (comparisonIntensity / baselineIntensity - 1) * 100;
    }
    static isCompliant(actualIntensity) {
        return actualIntensity <= this.TARGET_INTENSITY_2025;
    }
}
exports.ComplianceMath = ComplianceMath;
