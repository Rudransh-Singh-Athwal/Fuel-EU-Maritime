import { ComplianceRepository, BankEntryRecord } from '../../../core/ports/ComplianceRepository';
import { prisma } from '../../../infrastructure/db/prisma';

export class PrismaComplianceRepository implements ComplianceRepository {
  async saveComplianceBalance(shipId: string, year: number, cb: number): Promise<void> {
    const existing = await prisma.shipCompliance.findFirst({
      where: { ship_id: shipId, year },
    });
    if (existing) {
      await prisma.shipCompliance.update({
        where: { id: existing.id },
        data: { cb_gco2eq: cb },
      });
    } else {
      await prisma.shipCompliance.create({
        data: { ship_id: shipId, year, cb_gco2eq: cb },
      });
    }
  }

  async getComplianceBalance(shipId: string, year: number): Promise<number | null> {
    const record = await prisma.shipCompliance.findFirst({
      where: { ship_id: shipId, year },
    });
    return record ? record.cb_gco2eq : null;
  }

  async saveBankEntry(shipId: string, year: number, amount: number): Promise<void> {
    await prisma.bankEntry.create({
      data: { ship_id: shipId, year, amount_gco2eq: amount },
    });
  }

  async getBankedAmount(shipId: string, year: number): Promise<number> {
    const entries = await prisma.bankEntry.findMany({
      where: { ship_id: shipId, year },
    });
    return entries.reduce((sum: number, e: any) => sum + e.amount_gco2eq, 0);
  }

  // NEW: returns full history of bank entries for a ship/year
  async getBankingRecords(shipId: string, year: number): Promise<BankEntryRecord[]> {
    return prisma.bankEntry.findMany({
      where: { ship_id: shipId, year },
      orderBy: { id: 'asc' },
    });
  }
}
