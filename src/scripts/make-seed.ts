import fs from "node:fs/promises";
import path from "node:path";

function pad(n: number) {
	return String(n).padStart(2, "0");
}

function timestamp() {
	const d = new Date();

	return [
		d.getFullYear(),
		pad(d.getMonth() + 1),
		pad(d.getDate()),
		pad(d.getHours()),
		pad(d.getMinutes()),
		pad(d.getSeconds()),
	].join("");
}

function toSafeName(input: string) {
	return input
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_:-]/g, "") // keep safe chars
		.replace(/_+/g, "_");
}

async function main() {
	const rawName = process.argv[2];

	if (!rawName) {
		console.error("Usage: npm run make:seed <seed-name>");
		process.exit(1);
	}

	const name = toSafeName(rawName);
	const dir = path.join(process.cwd(), "drizzle", "seeders");
	await fs.mkdir(dir, { recursive: true });

	const fileName = `${timestamp()}_${name}.ts`;
	const filePath = path.join(dir, fileName);

	const template = `import type { DB } from "@/server/db";
  
/**
 * Seed: ${name}
 * Created at: ${new Date().toISOString()}
 *
 * Make sure this seed is idempotent.
 */
export async function seed(db: DB) {
  // Example:
  // await db.insert(table).values(...).onConflictDoNothing();
}
`;

	await fs.writeFile(filePath, template, { encoding: "utf8" });

	console.log("Created seed:", filePath);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
