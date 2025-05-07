export { createAuthHandler } from './handlers/wallet-auth';
export { EncryptedJSONDatabase } from './db/encrypted-json-db';
export type { DatabaseInterface } from './db/interface';
export { db } from './db';
export { getAvailableRoles, getDefaultRole, isValidRole } from './utils/roles';
export { GET as getRoles } from './handlers/roles';