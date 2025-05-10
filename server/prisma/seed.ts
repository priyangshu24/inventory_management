import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Define the correct order for deleting data (reverse of dependencies)
const deleteOrder = [
  "expenseByCategory.json",  // Delete child tables first
  "salesSummary.json",
  "purchaseSummary.json",
  "expenseSummary.json",
  "sales.json",
  "purchases.json",
  "expenses.json",
  "products.json",
  "users.json",
];

// Define the correct order for creating data (dependencies first)
const createOrder = [
  "users.json",
  "products.json",
  "expenses.json",
  "expenseSummary.json",  // Create parent tables before children
  "expenseByCategory.json",
  "sales.json",
  "purchases.json",
  "salesSummary.json",
  "purchaseSummary.json",
];

async function deleteAllData(orderedFileNames: string[]) {
  for (const fileName of orderedFileNames) {
    const modelName = path.basename(fileName, path.extname(fileName));
    const capitalizedModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const model: any = prisma[capitalizedModelName as keyof typeof prisma];
    
    if (model) {
      try {
        await model.deleteMany();
        console.log(`✓ Cleared data from ${capitalizedModelName}`);
      } catch (error: any) {
        if (error.code === 'P2003') {
          console.log(`⚠ Skipping ${capitalizedModelName} due to foreign key constraint`);
          continue;
        }
        console.error(`❌ Error deleting from ${capitalizedModelName}:`, error);
      }
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  console.log("🗑️  Deleting existing data...");
  await deleteAllData(deleteOrder);

  console.log("\n🌱 Seeding new data...");
  for (const fileName of createOrder) {
    const filePath = path.join(dataDirectory, fileName);
    try {
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const modelName = path.basename(fileName, path.extname(fileName));
      const capitalizedModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      const model: any = prisma[capitalizedModelName as keyof typeof prisma];

      if (!model) {
        console.error(`❌ No Prisma model matches the file name: ${fileName}`);
        continue;
      }

      for (const data of jsonData) {
        try {
          await model.create({ data });
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log(`⚠ Skipping duplicate entry in ${modelName}`);
            continue;
          }
          throw error;
        }
      }

      console.log(`✓ Seeded ${modelName}`);
    } catch (error) {
      console.error(`❌ Error seeding ${fileName}:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });