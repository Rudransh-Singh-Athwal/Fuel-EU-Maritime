import { ComplianceRepository } from "../ports/ComplianceRepository";
import { PoolRepository, PoolMemberData } from "../ports/PoolRepository";
import { RouteRepository } from "../ports/RouteRepository";

const TARGET_INTENSITY = 89.3368; // gCO2e/MJ (2025 target, 2% below 91.16)
const ENERGY_FACTOR = 41000; // MJ per tonne of fuel

export class ComplianceService {
  constructor(
    private complianceRepo: ComplianceRepository,
    private poolRepo: PoolRepository,
    private routeRepo: RouteRepository,
  ) {}

  // Computes CB from routes if no stored record exists yet
  async getComplianceBalance(shipId: string, year: number): Promise<number> {
    const stored = await this.complianceRepo.getComplianceBalance(shipId, year);
    if (stored !== null) return stored;

    // Compute from routes using spec formula:
    // CB = (Target - Actual) × EnergyInScope
    // EnergyInScope = fuelConsumption × 41000 MJ/t
    const routes = await this.routeRepo.findByYear(year);
    if (routes.length === 0) return 0;

    // Find the specific route matching shipId (route_id serves as ship identifier)
    let route = routes.find((r) => r.route_id === shipId);

    // Fallback: use the baseline route, then the first route
    if (!route) {
      route = routes.find((r) => r.is_baseline) || routes[0];
    }

    const energyInScope = route.fuelConsumption * ENERGY_FACTOR;
    const cb = (TARGET_INTENSITY - route.ghg_intensity) * energyInScope;

    // Persist computed CB so subsequent calls are consistent
    await this.complianceRepo.saveComplianceBalance(shipId, year, cb);
    return cb;
  }

  // Returns per-route compliance balance for all routes in a year (for pooling)
  async getPerRouteCb(
    year: number,
  ): Promise<Array<{ shipId: string; cb_before: number; cb_after: number }>> {
    const routes = await this.routeRepo.findByYear(year);
    return routes.map((r) => {
      const energyInScope = r.fuelConsumption * ENERGY_FACTOR;
      const cb = (TARGET_INTENSITY - r.ghg_intensity) * energyInScope;
      return { shipId: r.route_id, cb_before: cb, cb_after: cb };
    });
  }

  async bankPositiveCb(shipId: string, year: number, amount: number) {
    const currentCb = await this.getComplianceBalance(shipId, year);
    if (currentCb <= 0) throw new Error("CB must be positive to bank surplus");
    if (amount <= 0) throw new Error("Amount must be greater than zero");
    if (amount > currentCb)
      throw new Error(
        `Cannot bank more than current CB (${currentCb.toFixed(2)})`,
      );

    const newCb = currentCb - amount;
    await this.complianceRepo.saveComplianceBalance(shipId, year, newCb);
    await this.complianceRepo.saveBankEntry(shipId, year, amount);

    return { cb_before: currentCb, applied: amount, cb_after: newCb };
  }

  async applyBankedSurplus(shipId: string, year: number, amount: number) {
    const bankedAmount = await this.complianceRepo.getBankedAmount(
      shipId,
      year,
    );
    if (bankedAmount <= 0) throw new Error("No banked surplus available");
    if (amount <= 0) throw new Error("Amount must be greater than zero");
    if (amount > bankedAmount)
      throw new Error(
        `Insufficient banked surplus. Available: ${bankedAmount.toFixed(2)}`,
      );

    const currentCb = await this.getComplianceBalance(shipId, year);
    const newCb = currentCb + amount;

    await this.complianceRepo.saveComplianceBalance(shipId, year, newCb);
    await this.complianceRepo.saveBankEntry(shipId, year, -amount); // negative = applied

    return { cb_before: currentCb, applied: amount, cb_after: newCb };
  }

  async getBankingRecords(shipId: string, year: number) {
    return this.complianceRepo.getBankingRecords(shipId, year);
  }

  async createPool(
    year: number,
    members: { shipId: string; cb_before: number }[],
  ) {
    const sumCb = members.reduce((sum, m) => sum + m.cb_before, 0);
    if (sumCb < 0) throw new Error("Pool total CB must be >= 0");

    // Greedy allocation: sort desc by CB, surplus ships fill deficit ships
    const sorted = [...members].sort((a, b) => b.cb_before - a.cb_before);

    const result: PoolMemberData[] = sorted.map((m) => ({
      ship_id: m.shipId,
      cb_before: m.cb_before,
      cb_after: m.cb_before,
    }));

    let availableSurplus = 0;
    const deficits: PoolMemberData[] = [];

    for (const member of result) {
      if (member.cb_before > 0) {
        availableSurplus += member.cb_before;
        member.cb_after = 0;
      } else {
        deficits.push(member);
      }
    }

    for (const deficit of deficits) {
      const needed = Math.abs(deficit.cb_before);
      if (availableSurplus >= needed) {
        availableSurplus -= needed;
        deficit.cb_after = 0;
      } else {
        deficit.cb_after = -(needed - availableSurplus);
        availableSurplus = 0;
      }
    }

    // Return remaining surplus to the top surplus ship
    if (availableSurplus > 0) {
      const surplusShip = result.find((m) => m.cb_before > 0);
      if (surplusShip) surplusShip.cb_after = availableSurplus;
    }

    await this.poolRepo.createPool(year, result);

    return { members: result, sumCb, isValid: true };
  }
}
