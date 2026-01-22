import type { Config } from "drizzle-kit";

import { serverEnv } from "@/env/serverEnv";

export default {
	schema: "./src/server/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: serverEnv.DATABASE_URL,
	},
	tablesFilter: ["ecomercx_*"],
	casing: "snake_case",
} satisfies Config;
