import { describe, it, expect, vi, beforeEach } from "vitest";
import { RouteService } from "./RouteService";
import { RouteRepository } from "../ports/RouteRepository";
import { Route } from "../domain/Route";

const mockRouteRepo: RouteRepository = {
  findAll: vi.fn(),
  findBaseline: vi.fn(),
  setBaseline: vi.fn(),
  findByYear: vi.fn(),
};

const sampleRoutes: Route[] = [
  {
    route_id: "R001",
    vesselType: "Tanker",
    fuelType: "HFO",
    year: 2024,
    ghg_intensity: 91.16,
    fuelConsumption: 500,
    distance: 1200,
    totalEmissions: 45580,
    is_baseline: true,
  },
  {
    route_id: "R002",
    vesselType: "Bulk Carrier",
    fuelType: "LNG",
    year: 2024,
    ghg_intensity: 76.0,
    fuelConsumption: 300,
    distance: 800,
    totalEmissions: 22800,
    is_baseline: false,
  },
];

describe("RouteService", () => {
  let service: RouteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RouteService(mockRouteRepo);
  });

  describe("getAllRoutes", () => {
    it("returns all routes from the repository", async () => {
      vi.mocked(mockRouteRepo.findAll).mockResolvedValue(sampleRoutes);

      const routes = await service.getAllRoutes();

      expect(routes).toEqual(sampleRoutes);
      expect(mockRouteRepo.findAll).toHaveBeenCalledOnce();
    });

    it("returns empty array when no routes exist", async () => {
      vi.mocked(mockRouteRepo.findAll).mockResolvedValue([]);

      const routes = await service.getAllRoutes();

      expect(routes).toEqual([]);
    });
  });

  describe("setBaseline", () => {
    it("delegates to repository", async () => {
      vi.mocked(mockRouteRepo.setBaseline).mockResolvedValue(undefined);

      await service.setBaseline("R001");

      expect(mockRouteRepo.setBaseline).toHaveBeenCalledWith("R001");
    });
  });

  describe("getComparison", () => {
    it("returns null baseline when no baseline is set", async () => {
      vi.mocked(mockRouteRepo.findBaseline).mockResolvedValue(null);

      const result = await service.getComparison();

      expect(result).toEqual({ baseline: null, comparisons: [] });
    });

    it("returns comparisons against the baseline route", async () => {
      vi.mocked(mockRouteRepo.findBaseline).mockResolvedValue(sampleRoutes[0]);
      vi.mocked(mockRouteRepo.findAll).mockResolvedValue(sampleRoutes);

      const result = await service.getComparison();

      expect(result.baseline).toEqual(sampleRoutes[0]);
      expect(result.comparisons).toHaveLength(1);
      expect(result.comparisons[0].routeId).toBe("R002");
      expect(result.comparisons[0].compliant).toBe(true); // 76 < 89.3368
      expect(result.comparisons[0].percentDiff).toBeCloseTo(
        (76.0 / 91.16 - 1) * 100,
        2,
      );
    });
  });
});
