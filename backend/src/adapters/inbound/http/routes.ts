import { Router } from "express";
import { RouteController } from "./RouteController";
import { ComplianceController } from "./ComplianceController";

export function createRouter(
  routeController: RouteController,
  complianceController: ComplianceController,
): Router {
  const router = Router();

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
