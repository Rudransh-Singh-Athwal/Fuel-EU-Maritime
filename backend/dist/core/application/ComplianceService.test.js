"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ComplianceService_1 = require("./ComplianceService");
const mockComplianceRepo = {
    saveComplianceBalance: vitest_1.vi.fn(),
    getComplianceBalance: vitest_1.vi.fn(),
    saveBankEntry: vitest_1.vi.fn(),
    getBankedAmount: vitest_1.vi.fn(),
    getBankingRecords: vitest_1.vi.fn(),
};
const mockPoolRepo = {
    createPool: vitest_1.vi.fn(),
};
const mockRouteRepo = {
    findAll: vitest_1.vi.fn(),
    findBaseline: vitest_1.vi.fn(),
    setBaseline: vitest_1.vi.fn(),
    findByYear: vitest_1.vi.fn(),
};
(0, vitest_1.describe)("ComplianceService", () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new ComplianceService_1.ComplianceService(mockComplianceRepo, mockPoolRepo, mockRouteRepo);
    });
    (0, vitest_1.describe)("getComplianceBalance", () => {
        (0, vitest_1.it)("returns stored CB when it exists", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(5000);
            const cb = await service.getComplianceBalance("S001", 2024);
            (0, vitest_1.expect)(cb).toBe(5000);
            (0, vitest_1.expect)(mockRouteRepo.findByYear).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)("computes CB from routes when no stored record exists", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(null);
            vitest_1.vi.mocked(mockRouteRepo.findByYear).mockResolvedValue([
                {
                    route_id: "R001",
                    vesselType: "Tanker",
                    fuelType: "HFO",
                    year: 2024,
                    ghg_intensity: 80,
                    fuelConsumption: 100,
                    distance: 500,
                    totalEmissions: 8000,
                    is_baseline: false,
                },
            ]);
            const cb = await service.getComplianceBalance("S001", 2024);
            // CB = (89.3368 - 80) * 100 * 41000 = 9.3368 * 4100000 = 38280880
            (0, vitest_1.expect)(cb).toBeCloseTo((89.3368 - 80) * 100 * 41000, 0);
            (0, vitest_1.expect)(mockComplianceRepo.saveComplianceBalance).toHaveBeenCalled();
        });
        (0, vitest_1.it)("returns 0 when no routes exist", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(null);
            vitest_1.vi.mocked(mockRouteRepo.findByYear).mockResolvedValue([]);
            const cb = await service.getComplianceBalance("S001", 2024);
            (0, vitest_1.expect)(cb).toBe(0);
        });
    });
    (0, vitest_1.describe)("bankPositiveCb", () => {
        (0, vitest_1.it)("banks a portion of positive CB", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(10000);
            const result = await service.bankPositiveCb("S001", 2024, 3000);
            (0, vitest_1.expect)(result.cb_before).toBe(10000);
            (0, vitest_1.expect)(result.applied).toBe(3000);
            (0, vitest_1.expect)(result.cb_after).toBe(7000);
            (0, vitest_1.expect)(mockComplianceRepo.saveComplianceBalance).toHaveBeenCalledWith("S001", 2024, 7000);
            (0, vitest_1.expect)(mockComplianceRepo.saveBankEntry).toHaveBeenCalledWith("S001", 2024, 3000);
        });
        (0, vitest_1.it)("throws when CB is not positive", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(-500);
            await (0, vitest_1.expect)(service.bankPositiveCb("S001", 2024, 100)).rejects.toThrow("CB must be positive to bank surplus");
        });
        (0, vitest_1.it)("throws when amount exceeds current CB", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(1000);
            await (0, vitest_1.expect)(service.bankPositiveCb("S001", 2024, 2000)).rejects.toThrow("Cannot bank more than current CB");
        });
    });
    (0, vitest_1.describe)("applyBankedSurplus", () => {
        (0, vitest_1.it)("applies banked surplus to current CB", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getBankedAmount).mockResolvedValue(5000);
            vitest_1.vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(-2000);
            const result = await service.applyBankedSurplus("S001", 2024, 2000);
            (0, vitest_1.expect)(result.cb_before).toBe(-2000);
            (0, vitest_1.expect)(result.applied).toBe(2000);
            (0, vitest_1.expect)(result.cb_after).toBe(0);
        });
        (0, vitest_1.it)("throws when no banked surplus is available", async () => {
            vitest_1.vi.mocked(mockComplianceRepo.getBankedAmount).mockResolvedValue(0);
            await (0, vitest_1.expect)(service.applyBankedSurplus("S001", 2024, 100)).rejects.toThrow("No banked surplus available");
        });
    });
    (0, vitest_1.describe)("createPool", () => {
        (0, vitest_1.it)("creates a valid pool when total CB is non-negative", async () => {
            vitest_1.vi.mocked(mockPoolRepo.createPool).mockResolvedValue(undefined);
            const members = [
                { shipId: "S001", cb_before: 5000 },
                { shipId: "S002", cb_before: -3000 },
            ];
            const result = await service.createPool(2024, members);
            (0, vitest_1.expect)(result.isValid).toBe(true);
            (0, vitest_1.expect)(result.sumCb).toBe(2000);
            (0, vitest_1.expect)(result.members).toHaveLength(2);
        });
        (0, vitest_1.it)("throws when pool total CB is negative", async () => {
            const members = [
                { shipId: "S001", cb_before: 1000 },
                { shipId: "S002", cb_before: -5000 },
            ];
            await (0, vitest_1.expect)(service.createPool(2024, members)).rejects.toThrow("Pool total CB must be >= 0");
        });
        (0, vitest_1.it)("redistributes surplus to cover deficit members", async () => {
            vitest_1.vi.mocked(mockPoolRepo.createPool).mockResolvedValue(undefined);
            const members = [
                { shipId: "S001", cb_before: 10000 },
                { shipId: "S002", cb_before: -3000 },
                { shipId: "S003", cb_before: -2000 },
            ];
            const result = await service.createPool(2024, members);
            // S001 had 10000, gives away 5000 to cover deficits, keeps 5000
            const s001 = result.members.find((m) => m.ship_id === "S001");
            const s002 = result.members.find((m) => m.ship_id === "S002");
            const s003 = result.members.find((m) => m.ship_id === "S003");
            (0, vitest_1.expect)(s002?.cb_after).toBe(0);
            (0, vitest_1.expect)(s003?.cb_after).toBe(0);
            (0, vitest_1.expect)(s001?.cb_after).toBe(5000);
        });
    });
});
