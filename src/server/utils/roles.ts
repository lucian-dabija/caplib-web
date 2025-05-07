/**
 * Gets available user roles from environment variables
 */
export function getAvailableRoles(): string[] {
  const roles = process.env.USER_ROLES || 'User,Administrator';
  return roles.split(',').map(role => role.trim()).filter(Boolean);
}

/**
 * Gets the default user role from environment variables
 */
export function getDefaultRole(): string {
  return process.env.DEFAULT_USER_ROLE || 'User';
}

/**
 * Validates if a role exists in the available roles
 */
export function isValidRole(role: string): boolean {
  const availableRoles = getAvailableRoles();
  return availableRoles.includes(role);
}