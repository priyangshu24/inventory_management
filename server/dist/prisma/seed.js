"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function deleteAllData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Delete in correct order (children first, then parents)
            console.log('Deleting existing data...');
            // First, delete dependent tables
            yield prisma.expenseByCategory.deleteMany();
            console.log('✓ Cleared ExpenseByCategory');
            yield prisma.sales.deleteMany();
            console.log('✓ Cleared Sales');
            yield prisma.purchases.deleteMany();
            console.log('✓ Cleared Purchases');
            // Then delete summary tables
            yield prisma.expenseSummary.deleteMany();
            console.log('✓ Cleared ExpenseSummary');
            yield prisma.salesSummary.deleteMany();
            console.log('✓ Cleared SalesSummary');
            yield prisma.purchaseSummary.deleteMany();
            console.log('✓ Cleared PurchaseSummary');
            // Finally delete independent tables
            yield prisma.expenses.deleteMany();
            console.log('✓ Cleared Expenses');
            yield prisma.products.deleteMany();
            console.log('✓ Cleared Products');
            yield prisma.users.deleteMany();
            console.log('✓ Cleared Users');
        }
        catch (error) {
            console.error('Error during deletion:', error);
            throw error;
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
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
            yield deleteAllData();
            for (const fileName of orderedFileNames) {
                const filePath = path_1.default.join(dataDirectory, fileName);
                if (!fs_1.default.existsSync(filePath)) {
                    console.log(`⚠️ Skipping ${fileName} - file not found`);
                    continue;
                }
                try {
                    const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
                    const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
                    const model = prisma[modelName];
                    if (!model) {
                        console.error(`❌ No Prisma model matches the file name: ${fileName}`);
                        continue;
                    }
                    for (const data of jsonData) {
                        yield model.create({ data });
                    }
                    console.log(`✓ Seeded ${modelName} with data from ${fileName}`);
                }
                catch (error) {
                    console.error(`❌ Error processing ${fileName}:`, error);
                }
            }
        }
        catch (error) {
            console.error('❌ Seed failed:', error);
            throw error;
        }
    });
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
