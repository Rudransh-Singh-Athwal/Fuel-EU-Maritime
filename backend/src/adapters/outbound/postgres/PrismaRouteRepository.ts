import { RouteRepository } from "../../../core/ports/RouteRepository";
import { Route } from "../../../core/domain/Route";
import { prisma } from "../../../infrastructure/db/prisma";

export class PrismaRouteRepository implements RouteRepository {
  async findAll(): Promise<Route[]> {
    return await prisma.route.findMany();
  }

  async findBaseline(): Promise<Route | null> {
    return await prisma.route.findFirst({ where: { is_baseline: true } });
  }

  async setBaseline(routeId: string): Promise<void> {
    await prisma.$transaction([
      prisma.route.updateMany({ data: { is_baseline: false } }),
      prisma.route.update({
        where: { route_id: routeId },
        data: { is_baseline: true },
      }),
    ]);
  }

  async findByYear(year: number): Promise<Route[]> {
    return prisma.route.findMany({ where: { year } });
  }
}
