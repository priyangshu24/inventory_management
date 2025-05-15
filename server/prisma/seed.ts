import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function deleteAllData() {
  try {
    // Delete in correct order (children first, then parents)
    console.log('Deleting existing data...');

    // First, delete dependent tables
    await prisma.expenseByCategory.deleteMany();
    console.log('✓ Cleared ExpenseByCategory');

    await prisma.sales.deleteMany();
    console.log('✓ Cleared Sales');

    await prisma.purchases.deleteMany();
    console.log('✓ Cleared Purchases');

    // Then delete summary tables
    await prisma.expenseSummary.deleteMany();
    console.log('✓ Cleared ExpenseSummary');

    await prisma.salesSummary.deleteMany();
    console.log('✓ Cleared SalesSummary');

    await prisma.purchaseSummary.deleteMany();
    console.log('✓ Cleared PurchaseSummary');

    // Finally delete independent tables
    await prisma.expenses.deleteMany();
    console.log('✓ Cleared Expenses');

    await prisma.products.deleteMany();
    console.log('✓ Cleared Products');

    await prisma.users.deleteMany();
    console.log('✓ Cleared Users');

  } catch (error) {
    console.error('Error during deletion:', error);
    throw error;
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  // Define creation order (parents first, then children)
  const orderedFileNames = [
    "users.json",
    "products.json",
    "expenseSummary.json",
    "salesSummary.json",
    "purchaseSummary.json",
    "expenses.json",
    "sales.json",
    "purchases.json",
    "expenseByCategory.json",
  ];

  try {
    await deleteAllData();

    for (const fileName of orderedFileNames) {
      const filePath = path.join(dataDirectory, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Skipping ${fileName} - file not found`);
        continue;
      }

      try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const modelName = path.basename(fileName, path.extname(fileName));
        const model: any = prisma[modelName as keyof typeof prisma];

        if (!model) {
          console.error(`❌ No Prisma model matches the file name: ${fileName}`);
          continue;
        }

        for (const data of jsonData) {
          await model.create({ data });
        }

        console.log(`✓ Seeded ${modelName} with data from ${fileName}`);
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });