import React, { useEffect, useState } from "react";
import { apiClient } from "../../infrastructure/apiClient";
import type { PoolMember, PoolData } from "../../../core/domain/types";

export const PoolingTab: React.FC = () => {
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [poolResult, setPoolResult] = useState<PoolData | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      const data = await apiClient.getAdjustedCb("2024");
      setMembers(data);
    };
    fetchMembers();
  }, []);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const currentSum = members
    .filter((m) => selectedIds.has(m.shipId))
    .reduce((acc, m) => acc + m.cb_before, 0);

  const isValidPool = currentSum >= 0 && selectedIds.size > 1;

  const handleCreatePool = async () => {
    const result = await apiClient.createPool(Array.from(selectedIds));
    setPoolResult(result);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Available Ships for Pooling</h2>
        <div
          className={`px-4 py-2 rounded font-bold ${currentSum >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          Pool Sum: {currentSum}
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Select</th>
              <th className="p-3">Ship ID</th>
              <th className="p-3">CB Before</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.shipId} className="border-b">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.shipId)}
                    onChange={() => toggleSelection(member.shipId)}
                    aria-label={`Select ship ${member.shipId}`}
                    className="w-5 h-5"
                  />
                </td>
                <td className="p-3">{member.shipId}</td>
                <td
                  className={`p-3 font-mono ${member.cb_before >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {member.cb_before}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleCreatePool}
        disabled={!isValidPool}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 mb-8"
      >
        Create Pool
      </button>

      {poolResult && (
        <div className="bg-white border rounded shadow p-6">
          <h3 className="text-lg font-bold mb-4">Pool Creation Successful</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Ship ID</th>
                <th className="p-3">CB Before</th>
                <th className="p-3">CB After Allocation</th>
              </tr>
            </thead>
            <tbody>
              {poolResult.members.map((m) => (
                <tr key={m.shipId} className="border-b">
                  <td className="p-3">{m.shipId}</td>
                  <td className="p-3">{m.cb_before}</td>
                  <td className="p-3 font-bold">{m.cb_after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
