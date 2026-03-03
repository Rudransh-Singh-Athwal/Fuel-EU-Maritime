"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPoolRepository = void 0;
const prisma_1 = require("../../../infrastructure/db/prisma");
class PrismaPoolRepository {
    async createPool(year, members) {
        await prisma_1.prisma.pool.create({
            data: {
                year,
                members: {
                    create: members.map((m) => ({
                        ship_id: m.ship_id,
                        cb_before: m.cb_before,
                        cb_after: m.cb_after,
                    })),
                },
            },
        });
    }
}
exports.PrismaPoolRepository = PrismaPoolRepository;
