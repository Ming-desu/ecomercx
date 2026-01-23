import dotenvExpand from "dotenv-expand";
import dotenvFlow from "dotenv-flow";
import { cleanEnv, host, num, str, url } from "envalid";

// 1. Load the files (handles .env, .env.local, etc.)
const env = dotenvFlow.config();

// 2. Expand the variables (handles the ${DB_USER} syntax)
dotenvExpand.expand(env);

// 3. Now validate the fully loaded process.env
export const serverEnv = cleanEnv(process.env, {
	NODE_ENV: str({
		choices: ["development", "test", "production"],
		default: "development",
	}),
	DB_HOST: host({ default: "localhost" }),
	DB_NAME: str({ default: "ecomercx" }),
	DB_USER: str({ default: "postgres" }),
	DB_PASS: str({ default: "neilneil123" }),
	DB_PORT: num({ default: 5432 }),
	DATABASE_URL: url(),
	AUTH_SECRET: str({ default: "JcxG12AJnyAz4PKljl4tA095KfT/+S7qNIyQuvk8SJg=" }),
});
