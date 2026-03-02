import {
  PoolRepository,
  PoolMemberData,
} from "../../../core/ports/PoolRepository";
import { prisma } from "../../../infrastructure/db/prisma";

export class PrismaPoolRepository implements PoolRepository {
  async createPool(year: number, members: PoolMemberData[]): Promise<void> {
    await prisma.pool.create({
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
