import type { PermissionName } from "@/server/rbac/permissions";

export function hasPermission(
	permissions: readonly PermissionName[],
	required: PermissionName,
) {
	return permissions.includes(required);
}

export function hasAllPermissions(
	permissions: readonly PermissionName[],
	required: readonly PermissionName[],
) {
	return required.every((p) => permissions.includes(p));
}

export function hasAnyPermission(
	permissions: readonly PermissionName[],
	required: readonly PermissionName[],
) {
	return required.some((p) => permissions.includes(p));
}
