"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRouteRepository = void 0;
const prisma_1 = require("../../../infrastructure/db/prisma");
class PrismaRouteRepository {
    async findAll() {
        return await prisma_1.prisma.route.findMany();
    }
    async findBaseline() {
        return await prisma_1.prisma.route.findFirst({ where: { is_baseline: true } });
    }
    async setBaseline(routeId) {
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.route.updateMany({ data: { is_baseline: false } }),
            prisma_1.prisma.route.update({
                where: { route_id: routeId },
                data: { is_baseline: true },
            }),
        ]);
    }
}
exports.PrismaRouteRepository = PrismaRouteRepository;
