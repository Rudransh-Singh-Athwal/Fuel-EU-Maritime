import { Request, Response } from 'express';
import { ComplianceService } from '../../../core/application/ComplianceService';

export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  getComplianceBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      const cb = await this.complianceService.getComplianceBalance(String(shipId), Number(year));
      res.json(cb);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // FIX: was returning hardcoded []
  getAdjustedCb = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      const cb = await this.complianceService.getComplianceBalance(
        String(shipId || 'S001'),
        Number(year || 2024),
      );
      // Return array format expected by frontend PoolingTab
      res.json([{ shipId: String(shipId || 'S001'), cb_before: cb, cb_after: cb }]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // FIX: was returning hardcoded []
  getBankingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;
      const records = await this.complianceService.getBankingRecords(
        String(shipId || 'S001'),
        Number(year || 2024),
      );
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  bankPositiveCb = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year, amount } = req.body;
      const result = await this.complianceService.bankPositiveCb(
        String(shipId),
        Number(year),
        Number(amount),
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  applyBankedSurplus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year, amount } = req.body;
      const result = await this.complianceService.applyBankedSurplus(
        String(shipId),
        Number(year),
        Number(amount),
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  createPool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year, members } = req.body;
      const result = await this.complianceService.createPool(Number(year), members);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
