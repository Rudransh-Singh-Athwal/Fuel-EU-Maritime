import { ComplianceRepository } from "../ports/ComplianceRepository";
import { PoolRepository, PoolMemberData } from "../ports/PoolRepository";

export class ComplianceService {
  constructor(
    private complianceRepo: ComplianceRepository,
    private poolRepo: PoolRepository,
  ) {}

  async getComplianceBalance(shipId: string, year: number): Promise<number> {
    const cb = await this.complianceRepo.getComplianceBalance(shipId, year);
    return cb !== null ? cb : 0;
  }

  async bankPositiveCb(shipId: string, year: number, amount: number) {
    const currentCb = await this.getComplianceBalance(shipId, year);
    if (currentCb <= 0) throw new Error("CB must be positive to bank");
    if (amount <= 0 || amount > currentCb)
      throw new Error("Invalid bank amount");

    const newCb = currentCb - amount;
    await this.complianceRepo.saveComplianceBalance(shipId, year, newCb);
    await this.complianceRepo.saveBankEntry(shipId, year, amount);

    return { cb_before: currentCb, applied: amount, cb_after: newCb };
  }

  async applyBankedSurplus(shipId: string, year: number, amount: number) {
    const bankedAmount = await this.complianceRepo.getBankedAmount(
      shipId,
      year,
    );
    if (amount <= 0 || amount > bankedAmount)
      throw new Error("Insufficient banked surplus");

    const currentCb = await this.getComplianceBalance(shipId, year);
    const newCb = currentCb + amount;

    await this.complianceRepo.saveComplianceBalance(shipId, year, newCb);
    await this.complianceRepo.saveBankEntry(shipId, year, -amount);

    return { cb_before: currentCb, applied: amount, cb_after: newCb };
  }

  async createPool(
    year: number,
    members: { shipId: string; cb_before: number }[],
  ) {
    const sumCb = members.reduce((sum, m) => sum + m.cb_before, 0);
    if (sumCb < 0) throw new Error("Pool sum must be >= 0");

    const sortedMembers = [...members].sort(
      (a, b) => b.cb_before - a.cb_before,
    );
    let availableSurplus = 0;
    const deficits = [];

    const result: PoolMemberData[] = sortedMembers.map((m) => ({
      ship_id: m.shipId,
      cb_before: m.cb_before,
      cb_after: m.cb_before,
    }));

    for (const member of result) {
      if (member.cb_after > 0) {
        availableSurplus += member.cb_after;
        member.cb_after = 0;
      } else if (member.cb_after < 0) {
        deficits.push(member);
      }
    }

    for (const deficit of deficits) {
      const needed = Math.abs(deficit.cb_after);
      if (availableSurplus >= needed) {
        availableSurplus -= needed;
        deficit.cb_after = 0;
      } else {
        deficit.cb_after += availableSurplus;
        availableSurplus = 0;
      }
    }

    if (availableSurplus > 0) {
      result[0].cb_after += availableSurplus;
    }

    await this.poolRepo.createPool(year, result);

    return { members: result, sumCb, isValid: true };
  }
}
