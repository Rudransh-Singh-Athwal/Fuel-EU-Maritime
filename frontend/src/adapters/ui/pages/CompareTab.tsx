import React, { useEffect, useState } from "react";
import type { ComparisonResult, Route } from "../../../core/domain/types";
import { apiClient } from "../../infrastructure/apiClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { CheckCircle, XCircle } from "lucide-react";

export const CompareTab: React.FC = () => {
  const [baseline, setBaseline] = useState<Route | null>(null);
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await apiClient.getComparison();
      setBaseline(data.baseline);
      setComparisons(data.comparisons);
    };
    fetchData();
  }, []);

  if (!baseline) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-400">
        Please set a baseline route in the Routes tab first.
      </div>
    );
  }

  const chartData = [
    {
      routeId: `${baseline.routeId} (Baseline)`,
      ghgIntensity: baseline.ghgIntensity,
    },
    ...comparisons.map((c) => ({
      routeId: c.routeId,
      ghgIntensity: c.ghgIntensity,
    })),
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Baseline: {baseline.routeId}</h2>

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600">
              <th className="p-3">Route ID</th>
              <th className="p-3">GHG Intensity</th>
              <th className="p-3">% Difference</th>
              <th className="p-3">Compliant</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comp) => (
              <tr key={comp.routeId} className="border-b dark:border-slate-700">
                <td className="p-3">{comp.routeId}</td>
                <td className="p-3">{comp.ghgIntensity.toFixed(2)}</td>
                <td className="p-3">{comp.percentDiff.toFixed(2)}%</td>
                <td className="p-3">
                  {comp.compliant ? (
                    <CheckCircle className="text-green-500 dark:text-green-400" />
                  ) : (
                    <XCircle className="text-red-500 dark:text-red-400" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="routeId" stroke="#94a3b8" />
            <YAxis domain={["auto", "auto"]} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                color: "#f8fafc",
              }}
            />
            <Legend />
            <ReferenceLine
              y={89.3368}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                position: "top",
                value: "Target (89.3368)",
                fill: "#ef4444",
              }}
            />
            <Bar dataKey="ghgIntensity" fill="#3b82f6" name="GHG Intensity" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
