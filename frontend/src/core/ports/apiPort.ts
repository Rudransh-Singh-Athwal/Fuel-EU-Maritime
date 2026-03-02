import type {
  Route,
  ComparisonResult,
  BankingData,
  PoolData,
  PoolMember,
} from "../domain/types";

export interface ApiPort {
  getRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<{
    baseline: Route | null;
    comparisons: ComparisonResult[];
  }>;
  getComplianceBalance(year: string): Promise<number>;
  bankPositiveCb(amount: number): Promise<BankingData>;
  applyBankedSurplus(amount: number): Promise<BankingData>;
  getAdjustedCb(year: string): Promise<PoolMember[]>;
  createPool(memberIds: string[]): Promise<PoolData>;
}
