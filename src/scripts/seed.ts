import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { db } from "@/server/db";

type Env = "development" | "test" | "production";

function shouldRunSeed(skipProd: boolean, env: Env = "development") {
	if (skipProd && env === "production") {
		return false;
	}

	return true;
}

async function main() {
	const dir = path.join(process.cwd(), "drizzle", "seeders");

	const files = (await fs.readdir(dir))
		.filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
		.sort();

	for (const file of files) {
		const filePath = path.join(dir, file);
		const mod = await import(pathToFileURL(filePath).href);

		if (typeof mod.seed !== "function") {
			console.log(`[SKIP] ${file} (no seed export)`);
			continue;
		}

		if (!shouldRunSeed(mod.skipProd ?? false, process.env.NODE_ENV)) {
			console.log(
				`[SKIP] ${file} (skipProd = true, env = ${process.env.NODE_ENV})`,
			);
			continue;
		}

		console.log(`[RUN] ${file}`);
		await mod.seed(db);
	}

	console.log("Done seeding");
	process.exit(0);
}

main().catch((e) => {
	console.error("Seed failed:", e);
	process.exit(1);
});
