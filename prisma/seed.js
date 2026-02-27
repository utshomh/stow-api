"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const env_1 = require("../src/config/env");
const prisma_1 = require("../src/utils/prisma");
async function seed() {
    const existingAdmin = await prisma_1.prisma.user.findUnique({
        where: { email: env_1.env.ADMIN_EMAIL },
    });
    if (existingAdmin) {
        console.log("ℹ️ Admin already exists. Skipping seed to protect existing data.");
        return;
    }
    const hashed = await bcrypt_1.default.hash(env_1.env.ADMIN_PASSWORD, 10);
    await prisma_1.prisma.user.create({
        data: {
            name: "Admin",
            email: env_1.env.ADMIN_EMAIL,
            password: hashed,
            role: client_1.Role.ADMIN,
        },
    });
    console.log("✅ Admin created successfully.");
}
seed()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
