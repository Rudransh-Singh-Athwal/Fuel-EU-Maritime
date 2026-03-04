import { describe, it, expect } from "vitest";
import { ComplianceMath } from "./ComplianceMath";

describe("ComplianceMath", () => {
  describe("calculateEnergyInScope", () => {
    it("returns fuel consumption multiplied by 41000", () => {
      expect(ComplianceMath.calculateEnergyInScope(100)).toBe(4_100_000);
    });

    it("returns 0 for zero fuel consumption", () => {
      expect(ComplianceMath.calculateEnergyInScope(0)).toBe(0);
    });
  });

  describe("calculateComplianceBalance", () => {
    it("returns positive CB when actual intensity is below target", () => {
      // Target is 89.3368, actual = 80 → positive balance
      const cb = ComplianceMath.calculateComplianceBalance(80, 100);
      const expected = (89.3368 - 80) * 100 * 41000;
      expect(cb).toBeCloseTo(expected, 2);
    });

    it("returns negative CB when actual intensity exceeds target", () => {
      const cb = ComplianceMath.calculateComplianceBalance(95, 100);
      const expected = (89.3368 - 95) * 100 * 41000;
      expect(cb).toBeCloseTo(expected, 2);
    });

    it("returns zero CB when actual equals target", () => {
      const cb = ComplianceMath.calculateComplianceBalance(89.3368, 100);
      expect(cb).toBeCloseTo(0, 2);
    });
  });

  describe("calculatePercentageDifference", () => {
    it("returns 0% when baseline and comparison are equal", () => {
      expect(ComplianceMath.calculatePercentageDifference(80, 80)).toBe(0);
    });

    it("returns positive % when comparison is higher", () => {
      // (88 / 80 - 1) * 100 = 10%
      expect(ComplianceMath.calculatePercentageDifference(80, 88)).toBeCloseTo(
        10,
        2,
      );
    });

    it("returns negative % when comparison is lower", () => {
      // (72 / 80 - 1) * 100 = -10%
      expect(ComplianceMath.calculatePercentageDifference(80, 72)).toBeCloseTo(
        -10,
        2,
      );
    });
  });

  describe("isCompliant", () => {
    it("returns true when intensity is below target", () => {
      expect(ComplianceMath.isCompliant(80)).toBe(true);
    });

    it("returns true when intensity equals target", () => {
      expect(ComplianceMath.isCompliant(89.3368)).toBe(true);
    });

    it("returns false when intensity exceeds target", () => {
      expect(ComplianceMath.isCompliant(95)).toBe(false);
    });
  });
});
