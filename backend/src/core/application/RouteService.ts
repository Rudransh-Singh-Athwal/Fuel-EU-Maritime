import { RouteRepository } from "../ports/RouteRepository";
import { Route } from "../domain/Route";
import { ComplianceMath } from "../domain/ComplianceMath";

export class RouteService {
  constructor(private routeRepo: RouteRepository) {}

  async getAllRoutes(): Promise<Route[]> {
    return await this.routeRepo.findAll();
  }

  async setBaseline(routeId: string): Promise<void> {
    await this.routeRepo.setBaseline(routeId);
  }

  async getComparison() {
    const baseline = await this.routeRepo.findBaseline();
    if (!baseline) return { baseline: null, comparisons: [] };

    const allRoutes = await this.routeRepo.findAll();
    const comparisons = allRoutes
      .filter((r) => r.route_id !== baseline.route_id)
      .map((r) => {
        const percentDiff = ComplianceMath.calculatePercentageDifference(
          baseline.ghg_intensity,
          r.ghg_intensity,
        );
        const compliant = ComplianceMath.isCompliant(r.ghg_intensity);
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
