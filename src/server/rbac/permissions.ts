export const PERMISSIONS = [
	// Customer
	{ name: "account:self:read", description: null, isDeprecated: false },
	{ name: "account:self:update", description: null, isDeprecated: false },
	{ name: "addresses:self:read", description: null, isDeprecated: false },
	{ name: "addresses:self:write", description: null, isDeprecated: false },
	{ name: "cart:self:read", description: null, isDeprecated: false },
	{ name: "cart:self:write", description: null, isDeprecated: false },
	{ name: "cart:self:checkout", description: null, isDeprecated: false },
	{ name: "orders:self:read", description: null, isDeprecated: false },
	{ name: "orders:self:create", description: null, isDeprecated: false },
	{ name: "orders:self:cancel", description: null, isDeprecated: false },
	{ name: "orders:self:return", description: null, isDeprecated: false },
	{
		name: "orders:self:invoice:download",
		description: null,
		isDeprecated: false,
	},
	{ name: "payments:self:initiate", description: null, isDeprecated: false },
	{ name: "payments:self:read", description: null, isDeprecated: false },
	{ name: "wishlist:self:read", description: null, isDeprecated: false },
	{ name: "wishlist:self:write", description: null, isDeprecated: false },
	{ name: "reviews:self:create", description: null, isDeprecated: false },

	// Public
	{ name: "catalog:read", description: null, isDeprecated: false },
	{ name: "products:read", description: null, isDeprecated: false },
	{ name: "categories:read", description: null, isDeprecated: false },
	{ name: "search:read", description: null, isDeprecated: false },

	// Admin
	{ name: "admin:access", description: null, isDeprecated: false },
	{ name: "users:any:read", description: null, isDeprecated: false },
	{ name: "users:any:update", description: null, isDeprecated: false },
	{ name: "users:any:ban", description: null, isDeprecated: false },
	{ name: "products:any:create", description: null, isDeprecated: false },
	{ name: "products:any:read", description: null, isDeprecated: false },
	{ name: "products:any:update", description: null, isDeprecated: false },
	{ name: "products:any:delete", description: null, isDeprecated: false },
	{ name: "products:any:publish", description: null, isDeprecated: false },
	{ name: "products:any:archive", description: null, isDeprecated: false },
	{ name: "categories:any:write", description: null, isDeprecated: false },
	{ name: "inventory:any:read", description: null, isDeprecated: false },
	{ name: "inventory:any:update", description: null, isDeprecated: false },
	{ name: "orders:any:read", description: null, isDeprecated: false },
	{ name: "orders:any:update", description: null, isDeprecated: false },
	{ name: "orders:any:cancel", description: null, isDeprecated: false },
	{ name: "orders:any:refund", description: null, isDeprecated: false },
	{ name: "orders:any:fulfill", description: null, isDeprecated: false },
	{ name: "orders:any:ship", description: null, isDeprecated: false },
	{ name: "payments:any:read", description: null, isDeprecated: false },
	{ name: "payments:any:refund", description: null, isDeprecated: false },

	// System
	{ name: "rbac:roles:any:read", description: null, isDeprecated: false },
	{ name: "rbac:roles:any:write", description: null, isDeprecated: false },
	{ name: "rbac:permissions:any:read", description: null, isDeprecated: false },
	{
		name: "rbac:permissions:any:write",
		description: null,
		isDeprecated: false,
	},
	{ name: "settings:global:read", description: null, isDeprecated: false },
	{ name: "settings:global:update", description: null, isDeprecated: false },
] as const;

export type PermissionName = (typeof PERMISSIONS)[number]["name"];
export type PermissionRow = (typeof PERMISSIONS)[number];
