"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const RouteService_1 = require("./RouteService");
(0, vitest_1.describe)('RouteService', () => {
    (0, vitest_1.it)('should fetch all routes correctly', async () => {
        const mockRepo = { findAll: vitest_1.vi.fn().mockResolvedValue([{ id: 1, routeId: 'R001' }]) };
        const service = new RouteService_1.RouteService(mockRepo);
        const result = await service.getAllRoutes();
        (0, vitest_1.expect)(result).toHaveLength(1);
        (0, vitest_1.expect)(result[0].routeId).toBe('R001');
    });
});
