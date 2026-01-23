import { sql } from "drizzle-orm";
import type { DB } from "@/server/db";
import { permissions, rolePermissions, roles } from "@/server/db/schema";
import { PERMISSIONS } from "@/server/rbac/permissions";
import { ROLE_DEFINITIONS } from "@/server/rbac/roles";

export async function seed(db: DB) {
	const upsertedRoles = await db
		.insert(roles)
		.values(
			Object.entries(ROLE_DEFINITIONS).map(([name, def]) => ({
				name,
				description: def.description,
				isSystem: def.isSystem,
			})),
		)
		.onConflictDoUpdate({
			target: roles.name,
			set: {
				description: sql`excluded.description`,
				isSystem: sql`excluded.is_system`,
			},
		})
		.returning();

	const upsertedPermissions = await db
		.insert(permissions)
		.values(
			PERMISSIONS.map((v) => ({
				name: v.name,
				description: v.description,
				isDeprecated: v.isDeprecated,
			})),
		)
		.onConflictDoUpdate({
			target: permissions.name,
			set: {
				description: sql`excluded.description`,
				isDeprecated: sql`excluded.is_deprecated`,
			},
		})
		.returning();

	const roleIdByName = new Map(upsertedRoles.map((r) => [r.name, r.id]));
	const permIdByName = new Map(upsertedPermissions.map((p) => [p.name, p.id]));

	const permissionNameList = PERMISSIONS.map((p) => p.name);

	const mappings: { roleId: string; permissionId: string }[] = [];

	for (const [roleName, def] of Object.entries(ROLE_DEFINITIONS)) {
		const roleId = roleIdByName.get(roleName);
		if (!roleId) continue;

		const perms =
			def.permissions === "ALL" ? permissionNameList : def.permissions;

		for (const permName of perms) {
			const permissionId = permIdByName.get(permName);
			if (!permissionId) continue;

			mappings.push({ roleId, permissionId });
		}
	}

	await db.insert(rolePermissions).values(mappings).onConflictDoNothing();
}
