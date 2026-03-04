import "dotenv/config";
import { prisma } from "../src/infrastructure/db/prisma";

async function main() {
  await prisma.route.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.bankEntry.deleteMany();

  await prisma.route.createMany({
    data: [
      {
        route_id: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghg_intensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        is_baseline: true,
      },
      {
        route_id: "R002",
        vesselType: "BulkCarrier",
        fuelType: "LNG",
        year: 2024,
        ghg_intensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        is_baseline: false,
      },
      {
        route_id: "R003",
        vesselType: "Tanker",
        fuelType: "MGO",
        year: 2024,
        ghg_intensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
        is_baseline: false,
      },
      {
        route_id: "R004",
        vesselType: "RoRo",
        fuelType: "HFO",
        year: 2025,
        ghg_intensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
        is_baseline: false,
      },
      {
        route_id: "R005",
        vesselType: "Container",
        fuelType: "LNG",
        year: 2025,
        ghg_intensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
        is_baseline: false,
      },
    ],
  });
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
