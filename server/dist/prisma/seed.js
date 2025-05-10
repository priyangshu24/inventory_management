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
// Define the correct order for deleting data (reverse of dependencies)
const deleteOrder = [
    "expenseByCategory.json", // Delete child tables first
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
    "expenseSummary.json", // Create parent tables before children
    "expenseByCategory.json",
    "sales.json",
    "purchases.json",
    "salesSummary.json",
    "purchaseSummary.json",
];
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const fileName of orderedFileNames) {
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const capitalizedModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
            const model = prisma[capitalizedModelName];
            if (model) {
                try {
                    yield model.deleteMany();
                    console.log(`✓ Cleared data from ${capitalizedModelName}`);
                }
                catch (error) {
                    if (error.code === 'P2003') {
                        console.log(`⚠ Skipping ${capitalizedModelName} due to foreign key constraint`);
                        continue;
                    }
                    console.error(`❌ Error deleting from ${capitalizedModelName}:`, error);
                }
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
        console.log("🗑️  Deleting existing data...");
        yield deleteAllData(deleteOrder);
        console.log("\n🌱 Seeding new data...");
        for (const fileName of createOrder) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            try {
                const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
                const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
                const capitalizedModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
                const model = prisma[capitalizedModelName];
                if (!model) {
                    console.error(`❌ No Prisma model matches the file name: ${fileName}`);
                    continue;
                }
                for (const data of jsonData) {
                    try {
                        yield model.create({ data });
                    }
                    catch (error) {
                        if (error.code === 'P2002') {
                            console.log(`⚠ Skipping duplicate entry in ${modelName}`);
                            continue;
                        }
                        throw error;
                    }
                }
                console.log(`✓ Seeded ${modelName}`);
            }
            catch (error) {
                console.error(`❌ Error seeding ${fileName}:`, error);
            }
        }
    });
}
main()
    .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
