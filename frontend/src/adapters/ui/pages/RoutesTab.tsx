import React, { useEffect, useState } from "react";
import type { Route } from "../../../core/domain/types";
import { apiClient } from "../../infrastructure/apiClient";

export const RoutesTab: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vesselFilter, setVesselFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const fetchRoutes = async () => {
    const data = await apiClient.getRoutes();
    setRoutes(data);
  };

  useEffect(() => {
    (async () => {
      await fetchRoutes();
    })();
  }, []);

  const handleSetBaseline = async (routeId: string) => {
    await apiClient.setBaseline(routeId);
    await fetchRoutes();
  };

  const filteredRoutes = routes.filter(
    (r) =>
      (vesselFilter
        ? r.vesselType.toLowerCase().includes(vesselFilter.toLowerCase())
        : true) &&
      (fuelFilter
        ? r.fuelType.toLowerCase().includes(fuelFilter.toLowerCase())
        : true) &&
      (yearFilter ? r.year.toString().includes(yearFilter) : true),
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter Vessel Type"
          className="border dark:border-slate-600 bg-transparent p-2 rounded w-full md:flex-1"
          value={vesselFilter}
          onChange={(e) => setVesselFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter Fuel Type"
          className="border dark:border-slate-600 bg-transparent p-2 rounded w-full md:flex-1"
          value={fuelFilter}
          onChange={(e) => setFuelFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter Year"
          className="border dark:border-slate-600 bg-transparent p-2 rounded w-full md:flex-1"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700 border-b dark:border-slate-600">
              <th className="p-3">Route ID</th>
              <th className="p-3">Vessel Type</th>
              <th className="p-3">Fuel Type</th>
              <th className="p-3">Year</th>
              <th className="p-3">GHG Intensity</th>
              <th className="p-3">Fuel Cons. (t)</th>
              <th className="p-3">Distance (km)</th>
              <th className="p-3">Total Emis. (t)</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map((route) => (
              <tr
                key={route.routeId}
                className={`border-b dark:border-slate-700 ${route.isBaseline ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
              >
                <td className="p-3">{route.routeId}</td>
                <td className="p-3">{route.vesselType}</td>
                <td className="p-3">{route.fuelType}</td>
                <td className="p-3">{route.year}</td>
                <td className="p-3">{route.ghgIntensity}</td>
                <td className="p-3">{route.fuelConsumption}</td>
                <td className="p-3">{route.distance}</td>
                <td className="p-3">{route.totalEmissions}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleSetBaseline(route.routeId)}
                    className={`px-4 py-2 rounded text-white whitespace-nowrap ${route.isBaseline ? "bg-green-500 dark:bg-green-600" : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"}`}
                    disabled={route.isBaseline}
                  >
                    {route.isBaseline ? "Baseline Set" : "Set Baseline"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
