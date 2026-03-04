import { describe, it, expect } from "vitest";
import type {
  Route,
  ComparisonResult,
  BankingData,
  PoolMember,
  PoolData,
} from "./types";

describe("Domain Types", () => {
  it("Route type has the correct shape", () => {
    const route: Route = {
      routeId: "R001",
      vesselType: "Tanker",
      fuelType: "HFO",
      year: 2024,
      ghgIntensity: 91.16,
      fuelConsumption: 500,
      distance: 1200,
      totalEmissions: 45580,
      isBaseline: true,
    };

    expect(route.routeId).toBe("R001");
    expect(route.isBaseline).toBe(true);
    expect(route.ghgIntensity).toBe(91.16);
  });

  it("ComparisonResult type has the correct shape", () => {
    const comparison: ComparisonResult = {
      routeId: "R002",
      ghgIntensity: 76.0,
      percentDiff: -16.63,
      compliant: true,
    };

    expect(comparison.compliant).toBe(true);
    expect(comparison.percentDiff).toBeLessThan(0);
  });

  it("BankingData type has the correct shape", () => {
    const banking: BankingData = {
      cb_before: 10000,
      applied: 3000,
      cb_after: 7000,
    };

    expect(banking.cb_after).toBe(banking.cb_before - banking.applied);
  });

  it("PoolData type has the correct shape", () => {
    const member: PoolMember = {
      shipId: "S001",
      cb_before: 5000,
      cb_after: 2000,
    };

    const pool: PoolData = {
      members: [member],
      sumCb: 5000,
      isValid: true,
    };

    expect(pool.isValid).toBe(true);
    expect(pool.members).toHaveLength(1);
    expect(pool.sumCb).toBe(5000);
  });
});
