import type { PermissionName } from "./permissions";

export const ROLE_DEFINITIONS = {
	"Super Admin": {
		description: "System Generated",
		isSystem: true,
		permissions: "ALL" as const,
	},

	Customer: {
		description: "Default customer role",
		isSystem: true,
		permissions: [
			"account:self:read",
			"account:self:update",
			"addresses:self:read",
			"addresses:self:write",
			"cart:self:read",
			"cart:self:write",
			"cart:self:checkout",
			"orders:self:read",
			"orders:self:create",
			"orders:self:cancel",
			"orders:self:return",
			"orders:self:invoice:download",
			"payments:self:initiate",
			"payments:self:read",
			"wishlist:self:read",
			"wishlist:self:write",
		] satisfies readonly PermissionName[],
	},
} as const;
