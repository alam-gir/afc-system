import { db } from "./index";
import { batchLevels } from "./schema";

const DEFAULT_LEVELS = [
  "A1.1",
  "A1.2",
  "A2.1",
  "A2.2",
  "B1.1",
  "B1.2",
  "B2.1",
  "B2.2",
  "C1",
  "C2",
];

async function main() {
  await db.insert(batchLevels).values(DEFAULT_LEVELS.map((name) => ({ name }))).onConflictDoNothing();
  console.log(`Seeded ${DEFAULT_LEVELS.length} default batch levels (existing ones skipped).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
