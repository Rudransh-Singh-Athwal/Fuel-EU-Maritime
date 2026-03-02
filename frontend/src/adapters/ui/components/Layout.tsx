import React, { useState } from "react";
import { RoutesTab } from "../pages/RoutesTab";
import { CompareTab } from "../pages/CompareTab";
import { BankingTab } from "../pages/BankingTab";
import { PoolingTab } from "../pages/PoolingTab";

export const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routes");

  const renderTab = () => {
    switch (activeTab) {
      case "routes":
        return <RoutesTab />;
      case "compare":
        return <CompareTab />;
      case "banking":
        return <BankingTab />;
      case "pooling":
        return <PoolingTab />;
      default:
        return <RoutesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white p-6 shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">
          FuelEU Maritime Compliance
        </h1>
      </header>

      <main className="max-w-7xl mx-auto mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b bg-gray-50">
          {["Routes", "Compare", "Banking", "Pooling"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-[600px]">{renderTab()}</div>
      </main>
    </div>
  );
};
