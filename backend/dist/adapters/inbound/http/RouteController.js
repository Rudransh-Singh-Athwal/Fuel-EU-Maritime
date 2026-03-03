"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteController = void 0;
class RouteController {
    routeService;
    constructor(routeService) {
        this.routeService = routeService;
    }
    getAllRoutes = async (req, res) => {
        try {
            const routes = await this.routeService.getAllRoutes();
            res.json(routes);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    setBaseline = async (req, res) => {
        try {
            const { id } = req.params;
            const routeId = Array.isArray(id) ? id[0] : id;
            await this.routeService.setBaseline(routeId);
            res.status(200).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getComparison = async (req, res) => {
        try {
            const comparison = await this.routeService.getComparison();
            res.json(comparison);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
exports.RouteController = RouteController;
