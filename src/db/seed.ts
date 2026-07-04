import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "@/lib/password";
import { eq } from "drizzle-orm";

async function main() {
  const loginId = "admin001";
  const [existing] = await db.select().from(users).where(eq(users.loginId, loginId)).limit(1);

  if (existing) {
    console.log(`Admin "${loginId}" already exists, skipping.`);
    return;
  }

  await db.insert(users).values({
    loginId,
    passwordHash: await hashPassword(loginId),
    role: "admin",
    name: "System Admin",
    email: "admin@example.com",
  });

  console.log(`Created admin user. loginId="${loginId}" password="${loginId}"`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
