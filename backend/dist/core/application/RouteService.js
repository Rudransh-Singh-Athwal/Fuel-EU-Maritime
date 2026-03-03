"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
const ComplianceMath_1 = require("../domain/ComplianceMath");
class RouteService {
    routeRepo;
    constructor(routeRepo) {
        this.routeRepo = routeRepo;
    }
    async getAllRoutes() {
        return await this.routeRepo.findAll();
    }
    async setBaseline(routeId) {
        await this.routeRepo.setBaseline(routeId);
    }
    async getComparison() {
        const baseline = await this.routeRepo.findBaseline();
        if (!baseline)
            return { baseline: null, comparisons: [] };
        const allRoutes = await this.routeRepo.findAll();
        const comparisons = allRoutes
            .filter((r) => r.route_id !== baseline.route_id)
            .map((r) => {
            const percentDiff = ComplianceMath_1.ComplianceMath.calculatePercentageDifference(baseline.ghg_intensity, r.ghg_intensity);
            const compliant = ComplianceMath_1.ComplianceMath.isCompliant(r.ghg_intensity);
            return {
                routeId: r.route_id,
                ghgIntensity: r.ghg_intensity,
                percentDiff,
                compliant,
            };
        });
        return { baseline, comparisons };
    }
}
exports.RouteService = RouteService;
