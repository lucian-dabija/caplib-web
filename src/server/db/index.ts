import { EncryptedJSONDatabase } from './encrypted-json-db';
import type { DatabaseInterface } from './interface';

export type { DatabaseInterface };
export { EncryptedJSONDatabase };
export const db = EncryptedJSONDatabase.getInstance();
export default db;