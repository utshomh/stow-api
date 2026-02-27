import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

import { env } from "../src/config/env";
import { prisma } from "../src/utils/prisma";

async function seed() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: env.ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log(
      "ℹ️ Admin already exists. Skipping seed to protect existing data.",
    );
    return;
  }

  const hashed = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: env.ADMIN_EMAIL,
      password: hashed,
      role: Role.ADMIN,
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
    await prisma.$disconnect();
  });
