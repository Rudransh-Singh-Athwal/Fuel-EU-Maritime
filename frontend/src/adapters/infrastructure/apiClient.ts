import type { ApiPort } from "../../core/ports/apiPort";
import type { Route } from "../../core/domain/types";
// import {
//   ComparisonResult,
//   BankingData,
//   PoolData,
//   PoolMember,
// } from "../../core/domain/types";

let mockRoutes: Route[] = [
  {
    routeId: "R001",
    vesselType: "Container",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: false,
  },
  {
    routeId: "R002",
    vesselType: "BulkCarrier",
    fuelType: "LNG",
    year: 2024,
    ghgIntensity: 88.0,
    fuelConsumption: 4800,
    distance: 11500,
    totalEmissions: 4200,
    isBaseline: false,
  },
  {
    routeId: "R003",
    vesselType: "Tanker",
    fuelType: "MGO",
    year: 2024,
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    distance: 12500,
    totalEmissions: 4700,
    isBaseline: false,
  },
  {
    routeId: "R004",
    vesselType: "RoRo",
    fuelType: "HFO",
    year: 2025,
    ghgIntensity: 89.2,
    fuelConsumption: 4900,
    distance: 11800,
    totalEmissions: 4300,
    isBaseline: false,
  },
  {
    routeId: "R005",
    vesselType: "Container",
    fuelType: "LNG",
    year: 2025,
    ghgIntensity: 90.5,
    fuelConsumption: 4950,
    distance: 11900,
    totalEmissions: 4400,
    isBaseline: false,
  },
];

let currentCb = 1500;
let bankedAmount = 500;

export const apiClient: ApiPort = {
  getRoutes: async () => {
    return [...mockRoutes];
  },

  setBaseline: async (routeId: string) => {
    mockRoutes = mockRoutes.map((r) => ({
      ...r,
      isBaseline: r.routeId === routeId,
    }));
  },

  getComparison: async () => {
    const baseline = mockRoutes.find((r) => r.isBaseline) || null;
    if (!baseline) return { baseline: null, comparisons: [] };

    const comparisons = mockRoutes
      .filter((r) => r.routeId !== baseline.routeId)
      .map((r) => {
        const percentDiff = (r.ghgIntensity / baseline.ghgIntensity - 1) * 100;
        return {
          routeId: r.routeId,
          ghgIntensity: r.ghgIntensity,
          percentDiff,
          compliant: r.ghgIntensity <= 89.3368,
        };
      });

    return { baseline, comparisons };
  },

  getComplianceBalance: async (_year: string) => {
    return currentCb;
  },

  bankPositiveCb: async (amount: number) => {
    if (currentCb <= 0) throw new Error("CB must be positive to bank");
    const cb_before = currentCb;
    currentCb -= amount;
    bankedAmount += amount;
    return { cb_before, applied: amount, cb_after: currentCb };
  },

  applyBankedSurplus: async (amount: number) => {
    if (amount > bankedAmount) throw new Error("Insufficient banked surplus");
    const cb_before = currentCb;
    currentCb += amount;
    bankedAmount -= amount;
    return { cb_before, applied: amount, cb_after: currentCb };
  },

  getAdjustedCb: async (_year: string) => {
    return [
      { shipId: "S001", cb_before: -500, cb_after: -500 },
      { shipId: "S002", cb_before: 1200, cb_after: 1200 },
      { shipId: "S003", cb_before: 300, cb_after: 300 },
    ];
  },

  createPool: async (_memberIds: string[]) => {
    const members = [
      { shipId: "S001", cb_before: -500, cb_after: 0 },
      { shipId: "S002", cb_before: 1200, cb_after: 700 },
    ];
    return {
      members,
      sumCb: 700,
      isValid: true,
    };
  },
};
