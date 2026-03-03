import React, { useEffect, useState } from 'react';
import { apiClient } from '../../infrastructure/apiClient';
import type { BankingData } from '../../../core/domain/types';

export const BankingTab: React.FC = () => {
  const [currentCb, setCurrentCb] = useState<number>(0);
  const [bankedAmount, setBankedAmount] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [kpi, setKpi] = useState<BankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    const cb = await apiClient.getComplianceBalance('2024');
    setCurrentCb(cb);
    // Fetch banking records to compute total banked
    try {
      const records = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/banking/records?shipId=S001&year=2024`,
      ).then((r) => r.json());
      const total = Array.isArray(records)
        ? records.reduce((sum: number, r: any) => sum + r.amount_gco2eq, 0)
        : 0;
      setBankedAmount(total);
    } catch {
      setBankedAmount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBank = async () => {
    try {
      setError(null);
      const result = await apiClient.bankPositiveCb(Number(amount));
      setKpi(result);
      setAmount('');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApply = async () => {
    try {
      setError(null);
      const result = await apiClient.applyBankedSurplus(Number(amount));
      setKpi(result);
      setAmount('');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const canBank = currentCb > 0;
  const canApply = bankedAmount > 0;
  const amountNum = Number(amount);
  const amountValid = amountNum > 0;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* CB Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border dark:border-slate-700 text-center">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Current Compliance Balance (CB)
          </h2>
          <p
            className={`text-2xl font-mono font-bold ${
              currentCb > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {loading ? '…' : currentCb.toFixed(0)} gCO₂eq
          </p>
          <span
            className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${
              currentCb > 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {currentCb > 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border dark:border-slate-700 text-center">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Total Banked Surplus
          </h2>
          <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
            {loading ? '…' : bankedAmount.toFixed(0)} gCO₂eq
          </p>
          <span className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Available to apply
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border dark:border-slate-700 mb-6">
        <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300">Actions</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (gCO₂eq)"
            min="0"
            className="border dark:border-slate-600 bg-transparent p-2 rounded w-full sm:flex-1"
          />
          <button
            onClick={handleBank}
            disabled={!canBank || !amountValid}
            title={!canBank ? 'CB must be positive to bank surplus' : undefined}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Bank Surplus
          </button>
          <button
            onClick={handleApply}
            disabled={!canApply || !amountValid}
            title={!canApply ? 'No banked surplus available' : undefined}
            className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Apply to Deficit
          </button>
        </div>
        {!canBank && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            ⚠ Bank Surplus disabled — CB must be positive
          </p>
        )}
        {!canApply && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Apply to Deficit disabled — no banked surplus available
          </p>
        )}
      </div>

      {/* KPI result after action */}
      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded border dark:border-slate-600 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">CB Before</div>
            <div className="text-xl font-bold">{kpi.cb_before.toFixed(0)}</div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded border dark:border-slate-600 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Applied</div>
            <div className="text-xl font-bold">{kpi.applied.toFixed(0)}</div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded border dark:border-slate-600 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">CB After</div>
            <div
              className={`text-xl font-bold ${
                kpi.cb_after > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {kpi.cb_after.toFixed(0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
