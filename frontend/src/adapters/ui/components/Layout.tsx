import React, { useState, useEffect } from "react";
import { RoutesTab } from "../pages/RoutesTab";
import { CompareTab } from "../pages/CompareTab";
import { BankingTab } from "../pages/BankingTab";
import { PoolingTab } from "../pages/PoolingTab";
import { apiClient } from "../../infrastructure/apiClient";
import { Sun, Moon, Loader2, AlertCircle } from "lucide-react";

export const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routes");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const routes = await apiClient.getRoutes();
        if (!routes || routes.length === 0) {
          throw new Error(
            "Could not connect to the backend or no data was found. Please ensure the server is running and the database is seeded.",
          );
        }
      } catch (err: Error | unknown) {
        setError(err instanceof Error ? err.message : "Failed to initialize application data.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
          FuelEU Maritime Compliance
        </h1>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium animate-pulse">
            Fetching data from server...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-slate-900 transition-colors duration-300 p-6">
        <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Connection Error
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-slate-900 dark:bg-slate-950 text-white p-6 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          FuelEU Maritime Compliance
        </h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-blue-200" />
          )}
        </button>
      </header>

      <main className="max-w-7xl mx-auto mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="flex border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          {["Routes", "Compare", "Banking", "Pooling"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-[600px] text-gray-900 dark:text-gray-100">
          {renderTab()}
        </div>
      </main>
    </div>
  );
};
