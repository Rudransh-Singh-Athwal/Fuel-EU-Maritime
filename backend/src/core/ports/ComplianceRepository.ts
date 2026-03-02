export interface ComplianceRecord {
  ship_id: string;
  year: number;
  cb_gco2eq: number;
}

export interface BankEntryRecord {
  ship_id: string;
  year: number;
  amount_gco2eq: number;
}

export interface ComplianceRepository {
  saveComplianceBalance(
    shipId: string,
    year: number,
    cb: number,
  ): Promise<void>;
  getComplianceBalance(shipId: string, year: number): Promise<number | null>;
  saveBankEntry(shipId: string, year: number, amount: number): Promise<void>;
  getBankedAmount(shipId: string, year: number): Promise<number>;
}
