import { describe, it, expect, vi, beforeEach } from "vitest";
import { ComplianceService } from "./ComplianceService";
import { ComplianceRepository } from "../ports/ComplianceRepository";
import { PoolRepository } from "../ports/PoolRepository";
import { RouteRepository } from "../ports/RouteRepository";

const mockComplianceRepo: ComplianceRepository = {
  saveComplianceBalance: vi.fn(),
  getComplianceBalance: vi.fn(),
  saveBankEntry: vi.fn(),
  getBankedAmount: vi.fn(),
  getBankingRecords: vi.fn(),
};

const mockPoolRepo: PoolRepository = {
  createPool: vi.fn(),
};

const mockRouteRepo: RouteRepository = {
  findAll: vi.fn(),
  findBaseline: vi.fn(),
  setBaseline: vi.fn(),
  findByYear: vi.fn(),
};

describe("ComplianceService", () => {
  let service: ComplianceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ComplianceService(
      mockComplianceRepo,
      mockPoolRepo,
      mockRouteRepo,
    );
  });

  describe("getComplianceBalance", () => {
    it("returns stored CB when it exists", async () => {
      vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(
        5000,
      );

      const cb = await service.getComplianceBalance("S001", 2024);

      expect(cb).toBe(5000);
      expect(mockRouteRepo.findByYear).not.toHaveBeenCalled();
    });

    it("computes CB from routes when no stored record exists", async () => {
      vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(
        null,
      );
      vi.mocked(mockRouteRepo.findByYear).mockResolvedValue([
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
      expect(cb).toBeCloseTo((89.3368 - 80) * 100 * 41000, 0);
      expect(mockComplianceRepo.saveComplianceBalance).toHaveBeenCalled();
    });

    it("returns 0 when no routes exist", async () => {
      vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(
        null,
      );
      vi.mocked(mockRouteRepo.findByYear).mockResolvedValue([]);

      const cb = await service.getComplianceBalance("S001", 2024);

      expect(cb).toBe(0);
    });
  });

  describe("bankPositiveCb", () => {
    it("banks a portion of positive CB", async () => {
      vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(
        10000,
      );

      const result = await service.bankPositiveCb("S001", 2024, 3000);

      expect(result.cb_before).toBe(10000);
      expect(result.applied).toBe(3000);
      expect(result.cb_after).toBe(7000);
      expect(mockComplianceRepo.saveComplianceBalance).toHaveBeenCalledWith(
        "S001",
        2024,
        7000,
      );
      expect(mockComplianceRepo.saveBankEntry).toHaveBeenCalledWith(
        "S001",
        2024,
        3000,
      );
    });

    it("throws when CB is not positive", async () => {
      vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(
        -500,
      );

      await expect(
        service.bankPositiveCb("S001", 2024, 100),
      ).rejects.toThrow("CB must be positive to bank surplus");
    });

    it("throws when amount exceeds current CB", async () => {
      vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(
        1000,
      );

      await expect(
        service.bankPositiveCb("S001", 2024, 2000),
      ).rejects.toThrow("Cannot bank more than current CB");
    });
  });

  describe("applyBankedSurplus", () => {
    it("applies banked surplus to current CB", async () => {
      vi.mocked(mockComplianceRepo.getBankedAmount).mockResolvedValue(5000);
      vi.mocked(mockComplianceRepo.getComplianceBalance).mockResolvedValue(
        -2000,
      );

      const result = await service.applyBankedSurplus("S001", 2024, 2000);

      expect(result.cb_before).toBe(-2000);
      expect(result.applied).toBe(2000);
      expect(result.cb_after).toBe(0);
    });

    it("throws when no banked surplus is available", async () => {
      vi.mocked(mockComplianceRepo.getBankedAmount).mockResolvedValue(0);

      await expect(
        service.applyBankedSurplus("S001", 2024, 100),
      ).rejects.toThrow("No banked surplus available");
    });
  });

  describe("createPool", () => {
    it("creates a valid pool when total CB is non-negative", async () => {
      vi.mocked(mockPoolRepo.createPool).mockResolvedValue(undefined);

      const members = [
        { shipId: "S001", cb_before: 5000 },
        { shipId: "S002", cb_before: -3000 },
      ];

      const result = await service.createPool(2024, members);

      expect(result.isValid).toBe(true);
      expect(result.sumCb).toBe(2000);
      expect(result.members).toHaveLength(2);
    });

    it("throws when pool total CB is negative", async () => {
      const members = [
        { shipId: "S001", cb_before: 1000 },
        { shipId: "S002", cb_before: -5000 },
      ];

      await expect(service.createPool(2024, members)).rejects.toThrow(
        "Pool total CB must be >= 0",
      );
    });

    it("redistributes surplus to cover deficit members", async () => {
      vi.mocked(mockPoolRepo.createPool).mockResolvedValue(undefined);

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

      expect(s002?.cb_after).toBe(0);
      expect(s003?.cb_after).toBe(0);
      expect(s001?.cb_after).toBe(5000);
    });
  });
});
