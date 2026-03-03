"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const PrismaRouteRepository_1 = require("./adapters/outbound/postgres/PrismaRouteRepository");
const PrismaComplianceRepository_1 = require("./adapters/outbound/postgres/PrismaComplianceRepository");
const PrismaPoolRepository_1 = require("./adapters/outbound/postgres/PrismaPoolRepository");
const RouteService_1 = require("./core/application/RouteService");
const ComplianceService_1 = require("./core/application/ComplianceService");
const RouteController_1 = require("./adapters/inbound/http/RouteController");
const ComplianceController_1 = require("./adapters/inbound/http/ComplianceController");
const routes_1 = require("./adapters/inbound/http/routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://fuel-eu-maritime-rsa.vercel.app",
    ],
    credentials: true,
}));
app.use(express_1.default.json());
const routeRepo = new PrismaRouteRepository_1.PrismaRouteRepository();
const complianceRepo = new PrismaComplianceRepository_1.PrismaComplianceRepository();
const poolRepo = new PrismaPoolRepository_1.PrismaPoolRepository();
const routeService = new RouteService_1.RouteService(routeRepo);
const complianceService = new ComplianceService_1.ComplianceService(complianceRepo, poolRepo);
const routeController = new RouteController_1.RouteController(routeService);
const complianceController = new ComplianceController_1.ComplianceController(complianceService);
const router = (0, routes_1.createRouter)(routeController, complianceController);
app.use("/", router);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
