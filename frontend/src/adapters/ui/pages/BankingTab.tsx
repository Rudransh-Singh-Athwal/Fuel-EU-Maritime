import React, { useEffect, useState } from "react";
import { apiClient } from "../../infrastructure/apiClient";
import type { BankingData } from "../../../core/domain/types";

export const BankingTab: React.FC = () => {
  const [currentCb, setCurrentCb] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [kpi, setKpi] = useState<BankingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCb = async () => {
    const cb = await apiClient.getComplianceBalance("2024");
    setCurrentCb(cb);
  };

  useEffect(() => {
    const loadCb = async () => {
      const cb = await apiClient.getComplianceBalance("2024");
      setCurrentCb(cb);
    };
    loadCb();
  }, []);

  const handleBank = async () => {
    try {
      setError(null);
      const result = await apiClient.bankPositiveCb(Number(amount));
      setKpi(result);
      await fetchCb();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleApply = async () => {
    try {
      setError(null);
      const result = await apiClient.applyBankedSurplus(Number(amount));
      setKpi(result);
      await fetchCb();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const isDisabled = currentCb <= 0;

  return (
    <div className="p-6 max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Current Compliance Balance (CB)
        </h2>
        <p
          className={`text-3xl font-mono ${currentCb > 0 ? "text-green-600" : "text-red-600"}`}
        >
          {currentCb} gCO₂eq
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <div className="flex gap-4 mb-8">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleBank}
          disabled={isDisabled}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          Bank Surplus
        </button>
        <button
          onClick={handleApply}
          className="bg-purple-600 text-white px-6 py-2 rounded"
        >
          Apply to Deficit
        </button>
      </div>

      {kpi && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded border">
            <div className="text-sm text-gray-500">CB Before</div>
            <div className="text-xl font-bold">{kpi.cb_before}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded border">
            <div className="text-sm text-gray-500">Applied</div>
            <div className="text-xl font-bold">{kpi.applied}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded border">
            <div className="text-sm text-gray-500">CB After</div>
            <div className="text-xl font-bold">{kpi.cb_after}</div>
          </div>
        </div>
      )}
    </div>
  );
};
