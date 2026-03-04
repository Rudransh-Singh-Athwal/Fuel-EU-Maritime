"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const RouteService_1 = require("./RouteService");
const mockRouteRepo = {
    findAll: vitest_1.vi.fn(),
    findBaseline: vitest_1.vi.fn(),
    setBaseline: vitest_1.vi.fn(),
    findByYear: vitest_1.vi.fn(),
};
const sampleRoutes = [
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
(0, vitest_1.describe)("RouteService", () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new RouteService_1.RouteService(mockRouteRepo);
    });
    (0, vitest_1.describe)("getAllRoutes", () => {
        (0, vitest_1.it)("returns all routes from the repository", async () => {
            vitest_1.vi.mocked(mockRouteRepo.findAll).mockResolvedValue(sampleRoutes);
            const routes = await service.getAllRoutes();
            (0, vitest_1.expect)(routes).toEqual(sampleRoutes);
            (0, vitest_1.expect)(mockRouteRepo.findAll).toHaveBeenCalledOnce();
        });
        (0, vitest_1.it)("returns empty array when no routes exist", async () => {
            vitest_1.vi.mocked(mockRouteRepo.findAll).mockResolvedValue([]);
            const routes = await service.getAllRoutes();
            (0, vitest_1.expect)(routes).toEqual([]);
        });
    });
    (0, vitest_1.describe)("setBaseline", () => {
        (0, vitest_1.it)("delegates to repository", async () => {
            vitest_1.vi.mocked(mockRouteRepo.setBaseline).mockResolvedValue(undefined);
            await service.setBaseline("R001");
            (0, vitest_1.expect)(mockRouteRepo.setBaseline).toHaveBeenCalledWith("R001");
        });
    });
    (0, vitest_1.describe)("getComparison", () => {
        (0, vitest_1.it)("returns null baseline when no baseline is set", async () => {
            vitest_1.vi.mocked(mockRouteRepo.findBaseline).mockResolvedValue(null);
            const result = await service.getComparison();
            (0, vitest_1.expect)(result).toEqual({ baseline: null, comparisons: [] });
        });
        (0, vitest_1.it)("returns comparisons against the baseline route", async () => {
            vitest_1.vi.mocked(mockRouteRepo.findBaseline).mockResolvedValue(sampleRoutes[0]);
            vitest_1.vi.mocked(mockRouteRepo.findAll).mockResolvedValue(sampleRoutes);
            const result = await service.getComparison();
            (0, vitest_1.expect)(result.baseline).toEqual(sampleRoutes[0]);
            (0, vitest_1.expect)(result.comparisons).toHaveLength(1);
            (0, vitest_1.expect)(result.comparisons[0].routeId).toBe("R002");
            (0, vitest_1.expect)(result.comparisons[0].compliant).toBe(true); // 76 < 89.3368
            (0, vitest_1.expect)(result.comparisons[0].percentDiff).toBeCloseTo((76.0 / 91.16 - 1) * 100, 2);
        });
    });
});
