import { Route } from '../domain/Route';

export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findBaseline(): Promise<Route | null>;
  setBaseline(routeId: string): Promise<void>;
  findByYear(year: number): Promise<Route[]>;
}
