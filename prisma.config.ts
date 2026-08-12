import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaNeon } from "@prisma/adapter-neon";

export default defineConfig({
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // @ts-ignore
    adapter: () => {
      const neon = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
      return neon;
    },
  },
});
