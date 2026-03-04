"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ComplianceMath_1 = require("./ComplianceMath");
(0, vitest_1.describe)("ComplianceMath", () => {
    (0, vitest_1.describe)("calculateEnergyInScope", () => {
        (0, vitest_1.it)("returns fuel consumption multiplied by 41000", () => {
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.calculateEnergyInScope(100)).toBe(4_100_000);
        });
        (0, vitest_1.it)("returns 0 for zero fuel consumption", () => {
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.calculateEnergyInScope(0)).toBe(0);
        });
    });
    (0, vitest_1.describe)("calculateComplianceBalance", () => {
        (0, vitest_1.it)("returns positive CB when actual intensity is below target", () => {
            // Target is 89.3368, actual = 80 → positive balance
            const cb = ComplianceMath_1.ComplianceMath.calculateComplianceBalance(80, 100);
            const expected = (89.3368 - 80) * 100 * 41000;
            (0, vitest_1.expect)(cb).toBeCloseTo(expected, 2);
        });
        (0, vitest_1.it)("returns negative CB when actual intensity exceeds target", () => {
            const cb = ComplianceMath_1.ComplianceMath.calculateComplianceBalance(95, 100);
            const expected = (89.3368 - 95) * 100 * 41000;
            (0, vitest_1.expect)(cb).toBeCloseTo(expected, 2);
        });
        (0, vitest_1.it)("returns zero CB when actual equals target", () => {
            const cb = ComplianceMath_1.ComplianceMath.calculateComplianceBalance(89.3368, 100);
            (0, vitest_1.expect)(cb).toBeCloseTo(0, 2);
        });
    });
    (0, vitest_1.describe)("calculatePercentageDifference", () => {
        (0, vitest_1.it)("returns 0% when baseline and comparison are equal", () => {
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.calculatePercentageDifference(80, 80)).toBe(0);
        });
        (0, vitest_1.it)("returns positive % when comparison is higher", () => {
            // (88 / 80 - 1) * 100 = 10%
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.calculatePercentageDifference(80, 88)).toBeCloseTo(10, 2);
        });
        (0, vitest_1.it)("returns negative % when comparison is lower", () => {
            // (72 / 80 - 1) * 100 = -10%
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.calculatePercentageDifference(80, 72)).toBeCloseTo(-10, 2);
        });
    });
    (0, vitest_1.describe)("isCompliant", () => {
        (0, vitest_1.it)("returns true when intensity is below target", () => {
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.isCompliant(80)).toBe(true);
        });
        (0, vitest_1.it)("returns true when intensity equals target", () => {
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.isCompliant(89.3368)).toBe(true);
        });
        (0, vitest_1.it)("returns false when intensity exceeds target", () => {
            (0, vitest_1.expect)(ComplianceMath_1.ComplianceMath.isCompliant(95)).toBe(false);
        });
    });
});
