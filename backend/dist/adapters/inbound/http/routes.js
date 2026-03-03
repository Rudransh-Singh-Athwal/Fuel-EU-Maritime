"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = createRouter;
const express_1 = require("express");
function createRouter(routeController, complianceController) {
    const router = (0, express_1.Router)();
    router.get("/routes", routeController.getAllRoutes);
    router.post("/routes/:id/baseline", routeController.setBaseline);
    router.get("/routes/comparison", routeController.getComparison);
    router.get("/compliance/cb", complianceController.getComplianceBalance);
    router.get("/compliance/adjusted-cb", complianceController.getAdjustedCb);
    router.get("/banking/records", complianceController.getBankingRecords);
    router.post("/banking/bank", complianceController.bankPositiveCb);
    router.post("/banking/apply", complianceController.applyBankedSurplus);
    router.post("/pools", complianceController.createPool);
    return router;
}
