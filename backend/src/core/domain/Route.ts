export interface Route {
  id?: number;
  route_id: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghg_intensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  is_baseline: boolean;
}
