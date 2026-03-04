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
    // FIX: was returning hardcoded []
    getAdjustedCb = async (req, res) => {
        try {
            const { shipId, year } = req.query;
            const cb = await this.complianceService.getComplianceBalance(String(shipId || "S001"), Number(year || 2024));
            // Return array format expected by frontend PoolingTab
            res.json([
                { shipId: String(shipId || "S001"), cb_before: cb, cb_after: cb },
            ]);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    // FIX: was returning hardcoded []
    getBankingRecords = async (req, res) => {
        try {
            const { shipId, year } = req.query;
            const records = await this.complianceService.getBankingRecords(String(shipId || "S001"), Number(year || 2024));
            res.json(records);
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
