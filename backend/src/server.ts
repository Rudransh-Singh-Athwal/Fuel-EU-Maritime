import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaRouteRepository } from "./adapters/outbound/postgres/PrismaRouteRepository";
import { PrismaComplianceRepository } from "./adapters/outbound/postgres/PrismaComplianceRepository";
import { PrismaPoolRepository } from "./adapters/outbound/postgres/PrismaPoolRepository";
import { RouteService } from "./core/application/RouteService";
import { ComplianceService } from "./core/application/ComplianceService";
import { RouteController } from "./adapters/inbound/http/RouteController";
import { ComplianceController } from "./adapters/inbound/http/ComplianceController";
import { createRouter } from "./adapters/inbound/http/routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fuel-eu-maritime-rsa.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

const routeRepo = new PrismaRouteRepository();
const complianceRepo = new PrismaComplianceRepository();
const poolRepo = new PrismaPoolRepository();

const routeService = new RouteService(routeRepo);
const complianceService = new ComplianceService(complianceRepo, poolRepo);

const routeController = new RouteController(routeService);
const complianceController = new ComplianceController(complianceService);

const router = createRouter(routeController, complianceController);
app.use("/", router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});