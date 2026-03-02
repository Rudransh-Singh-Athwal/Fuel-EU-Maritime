import { Request, Response } from "express";
import { RouteService } from "../../../core/application/RouteService";

export class RouteController {
  constructor(private routeService: RouteService) {}

  getAllRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
      const routes = await this.routeService.getAllRoutes();
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  setBaseline = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const routeId = Array.isArray(id) ? id[0] : id;
      await this.routeService.setBaseline(routeId);
      res.status(200).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getComparison = async (req: Request, res: Response): Promise<void> => {
    try {
      const comparison = await this.routeService.getComparison();
      res.json(comparison);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
