"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceController = void 0;
class ComplianceController {
    complianceService;
    constructor(complianceService) {
        this.complianceService = complianceService;
    }
    getComplianceBalance = async (req, res) => {
        try {
            const { shipId, year } = req.query;
            const cb = await this.complianceService.getComplianceBalance(String(shipId), Number(year));
            res.json(cb);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getAdjustedCb = async (req, res) => {
        try {
            res.json([]);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getBankingRecords = async (req, res) => {
        try {
            res.json([]);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    bankPositiveCb = async (req, res) => {
        try {
            const { shipId, year, amount } = req.body;
            const result = await this.complianceService.bankPositiveCb(String(shipId), Number(year), Number(amount));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    applyBankedSurplus = async (req, res) => {
        try {
            const { shipId, year, amount } = req.body;
            const result = await this.complianceService.applyBankedSurplus(String(shipId), Number(year), Number(amount));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    createPool = async (req, res) => {
        try {
            const { year, members } = req.body;
            const result = await this.complianceService.createPool(Number(year), members);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.ComplianceController = ComplianceController;
