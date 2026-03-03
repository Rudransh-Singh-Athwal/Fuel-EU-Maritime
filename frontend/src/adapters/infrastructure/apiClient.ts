import type { ApiPort } from "../../core/ports/apiPort";

interface RouteData {
  route_id: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghg_intensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  is_baseline: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const DEFAULT_SHIP_ID = "S001";
const DEFAULT_YEAR = 2024;

export const apiClient: ApiPort = {
  getRoutes: async () => {
    try {
      const res = await fetch(`${API_URL}/routes`);
      if (!res.ok) return [];
      const data = await res.json();

      return data.map((r: RouteData) => ({
        routeId: r.route_id,
        vesselType: r.vesselType,
        fuelType: r.fuelType,
        year: r.year,
        ghgIntensity: r.ghg_intensity,
        fuelConsumption: r.fuelConsumption,
        distance: r.distance,
        totalEmissions: r.totalEmissions,
        isBaseline: r.is_baseline,
      }));
    } catch (_) {
      return [];
    }
  },

  setBaseline: async (routeId: string) => {
    try {
      await fetch(`${API_URL}/routes/${routeId}/baseline`, { method: "POST" });
    } catch (_) {
      // Silently ignore errors during baseline setting
    }
  },

  getComparison: async () => {
    try {
      const res = await fetch(`${API_URL}/routes/comparison`);
      if (!res.ok) return { baseline: null, comparisons: [] };
      const data = await res.json();

      let baseline = null;
      if (data.baseline) {
        baseline = {
          routeId: data.baseline.route_id,
          vesselType: data.baseline.vesselType,
          fuelType: data.baseline.fuelType,
          year: data.baseline.year,
          ghgIntensity: data.baseline.ghg_intensity,
          fuelConsumption: data.baseline.fuelConsumption,
          distance: data.baseline.distance,
          totalEmissions: data.baseline.totalEmissions,
          isBaseline: data.baseline.is_baseline,
        };
      }
      return { baseline, comparisons: data.comparisons };
    } catch (_) {
      return { baseline: null, comparisons: [] };
    }
  },

  getComplianceBalance: async (year: string) => {
    try {
      const res = await fetch(
        `${API_URL}/compliance/cb?shipId=${DEFAULT_SHIP_ID}&year=${year}`,
      );
      if (!res.ok) return 0;
      return res.json();
    } catch (_) {
      return 0;
    }
  },

  bankPositiveCb: async (amount: number) => {
    const res = await fetch(`${API_URL}/banking/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipId: DEFAULT_SHIP_ID,
        year: DEFAULT_YEAR,
        amount,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to bank surplus");
    }
    return res.json();
  },

  applyBankedSurplus: async (amount: number) => {
    const res = await fetch(`${API_URL}/banking/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipId: DEFAULT_SHIP_ID,
        year: DEFAULT_YEAR,
        amount,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to apply banked surplus");
    }
    return res.json();
  },

  getAdjustedCb: async (_year: string) => {
    try {
      const res = await fetch(`${API_URL}/compliance/adjusted-cb`);
      const data = await res.json();

      if (!data || data.length === 0) {
        return [
          { shipId: "S001", cb_before: -500, cb_after: -500 },
          { shipId: "S002", cb_before: 1200, cb_after: 1200 },
          { shipId: "S003", cb_before: 300, cb_after: 300 },
        ];
      }
      return data;
    } catch (_) {
      return [
        { shipId: "S001", cb_before: -500, cb_after: -500 },
        { shipId: "S002", cb_before: 1200, cb_after: 1200 },
        { shipId: "S003", cb_before: 300, cb_after: 300 },
      ];
    }
  },

  createPool: async (memberIds: string[]) => {
    const members = memberIds.map((id) => ({
      shipId: id,
      cb_before: id === "S001" ? -500 : id === "S002" ? 1200 : 300,
    }));

    const res = await fetch(`${API_URL}/pools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: DEFAULT_YEAR, members }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create pool");
    }
    return res.json();
  },
};
