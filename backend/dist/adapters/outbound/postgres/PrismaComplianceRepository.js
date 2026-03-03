"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaComplianceRepository = void 0;
const prisma_1 = require("../../../infrastructure/db/prisma");
class PrismaComplianceRepository {
    async saveComplianceBalance(shipId, year, cb) {
        const existing = await prisma_1.prisma.shipCompliance.findFirst({
            where: { ship_id: shipId, year },
        });
        if (existing) {
            await prisma_1.prisma.shipCompliance.update({
                where: { id: existing.id },
                data: { cb_gco2eq: cb },
            });
        }
        else {
            await prisma_1.prisma.shipCompliance.create({
                data: { ship_id: shipId, year, cb_gco2eq: cb },
            });
        }
    }
    async getComplianceBalance(shipId, year) {
        const record = await prisma_1.prisma.shipCompliance.findFirst({
            where: { ship_id: shipId, year },
        });
        return record ? record.cb_gco2eq : null;
    }
    async saveBankEntry(shipId, year, amount) {
        await prisma_1.prisma.bankEntry.create({
            data: { ship_id: shipId, year, amount_gco2eq: amount },
        });
    }
    async getBankedAmount(shipId, year) {
        const entries = await prisma_1.prisma.bankEntry.findMany({
            where: { ship_id: shipId, year },
        });
        return entries.reduce((sum, entry) => sum + entry.amount_gco2eq, 0);
    }
}
exports.PrismaComplianceRepository = PrismaComplianceRepository;
