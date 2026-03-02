export interface Route {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface ComparisonResult {
  routeId: string;
  ghgIntensity: number;
  percentDiff: number;
  compliant: boolean;
}

export interface BankingData {
  cb_before: number;
  applied: number;
  cb_after: number;
}

export interface PoolMember {
  shipId: string;
  cb_before: number;
  cb_after: number;
}

export interface PoolData {
  members: PoolMember[];
  sumCb: number;
  isValid: boolean;
}
