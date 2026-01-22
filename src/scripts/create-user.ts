import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

async function main() {
	const email = process.argv[2];
	const password = process.argv[3];
	const name = process.argv[4] ?? null;

	if (!email || !password) {
		console.error("Usage: npm run create-user -- <email> <password> [name]");
		process.exit(1);
	}

	const existing = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (existing) {
		console.error("User already exists: ", existing.email);
		process.exit(1);
	}

	const passwordHash = await argon2.hash(password, {
		type: argon2.argon2id,
	});

	const [created] = await db
		.insert(users)
		.values({
			email,
			name,
			passwordHash,
		})
		.returning();

	console.log("Created user: ", {
		id: created?.id,
		email: created?.email,
		name: created?.name,
	});

	process.exit(0);
}

main().catch((err) => {
	console.error("Failed to create user: ", err);
	process.exit(1);
});
