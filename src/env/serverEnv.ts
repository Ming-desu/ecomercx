import dotenvExpand from "dotenv-expand";
import dotenv from "dotenv-flow";
import { cleanEnv, host, num, str, url } from "envalid";

const loadedEnv = dotenv.config();
dotenvExpand.expand(loadedEnv);

export const serverEnv = cleanEnv(process.env, {
	NODE_ENV: str({
		choices: ["development", "test", "production"],
		default: "development",
	}),
	DB_HOST: host({ default: "localhost" }),
	DB_NAME: str({ default: "ecomercx" }),
	DB_USER: str({ default: "postgres" }),
	DB_PASS: str(),
	DB_PORT: num({ default: 5432 }),
	DATABASE_URL: url(),

	AUTH_SECRET: str(),
});
