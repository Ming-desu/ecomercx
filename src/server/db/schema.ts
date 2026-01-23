import { relations } from "drizzle-orm";
import {
	foreignKey,
	index,
	pgTableCreator,
	primaryKey,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

const timestamps = {
	createdAt: timestamp({ mode: "date", withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp({ mode: "date", withTimezone: true })
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date())
		.notNull(),
};

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `ecomercx_${name}`);

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.uuid()
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => /* @__PURE__ */ new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);

export const users = createTable("user", (d) => ({
	id: d
		.uuid()
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.$defaultFn(() => /* @__PURE__ */ new Date()),

	passwordHash: d.text(),
	image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),

	userRoles: many(userRoles),
	userPermissions: many(userPermissions),
}));

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d.uuid().notNull(),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "account_user_id_fk",
		}).onDelete("cascade"),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
		userId: d.uuid().notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [
		index("t_user_id_idx").on(t.userId),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "session_user_id_fk",
		}),
	],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const roles = createTable(
	"role",
	(d) => ({
		id: d
			.uuid()
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		isSystem: d.boolean().default(false).notNull(),
		...timestamps,
	}),
	(t) => [unique("role_name_unique").on(t.name)],
);

export const rolesRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
	rolePermissions: many(rolePermissions),
}));

export const permissions = createTable(
	"permission",
	(d) => ({
		id: d
			.uuid()
			.notNull()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		isDeprecated: d.boolean().default(false).notNull(),
		...timestamps,
	}),
	(t) => [unique("permission_name_unique").on(t.name)],
);

export const permissionsRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	userPermissions: many(userPermissions),
}));

export const rolePermissions = createTable(
	"role_permission",
	(d) => ({
		roleId: d.uuid().notNull(),
		permissionId: d.uuid().notNull(),
		createdAt: timestamp({ mode: "date", withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		primaryKey({ columns: [t.roleId, t.permissionId] }),
		foreignKey({
			columns: [t.roleId],
			foreignColumns: [roles.id],
			name: "rp_role_id_fk",
		}),
		foreignKey({
			columns: [t.permissionId],
			foreignColumns: [permissions.id],
			name: "rp_permission_id_fk",
		}),
	],
);

export const rolePermissionsRelations = relations(
	rolePermissions,
	({ one }) => ({
		role: one(roles, {
			fields: [rolePermissions.roleId],
			references: [roles.id],
		}),
		permission: one(permissions, {
			fields: [rolePermissions.permissionId],
			references: [permissions.id],
		}),
	}),
);

export const userRoles = createTable(
	"user_role",
	(d) => ({
		userId: d.uuid().notNull(),
		roleId: d.uuid().notNull(),
		createdAt: timestamp({ mode: "date", withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		primaryKey({ columns: [t.userId, t.roleId] }),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "ur_user_id_fk",
		}),
		foreignKey({
			columns: [t.roleId],
			foreignColumns: [roles.id],
			name: "ur_role_id_fk",
		}),
	],
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
	}),
	roleId: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id],
	}),
}));

export const userPermissions = createTable(
	"user_permission",
	(d) => ({
		userId: d.uuid().notNull(),
		permissionId: d.uuid().notNull(),
		createdAt: timestamp({ mode: "date", withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		primaryKey({ columns: [t.userId, t.permissionId] }),
		foreignKey({
			columns: [t.userId],
			foreignColumns: [users.id],
			name: "up_user_id_fk",
		}),
		foreignKey({
			columns: [t.permissionId],
			foreignColumns: [permissions.id],
			name: "up_permission_id_fk",
		}),
	],
);

export const userPermissionsRelations = relations(
	userPermissions,
	({ one }) => ({
		user: one(users, {
			fields: [userPermissions.userId],
			references: [users.id],
		}),
		permission: one(permissions, {
			fields: [userPermissions.permissionId],
			references: [permissions.id],
		}),
	}),
);
