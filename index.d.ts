/// <reference types="react" />

// Core types
export interface User {
  wallet_address: string;
  first_name?: string;
  last_name?: string;
  entity_name?: string;
  account_type: 'human' | 'entity';
  email?: string;
  role: string;
  created_at: string;
}

export interface NewUserData {
  wallet_address: string;
  first_name?: string;
  last_name?: string;
  entity_name?: string;
  account_type?: 'human' | 'entity';
  email?: string;
  role?: string;
}

export interface CapAuthConfig {
  appName: string;
  appDescription: string;
  theme?: {
    primary: string;
    secondary: string;
  };
  logo?: {
    src: string;
    width: number;
    height: number;
  };
  customStyles?: {
    container?: string;
    card?: string;
    button?: string;
    input?: string;
    select?: string;
  };
  redirectPath?: string;
  refreshPageOnAuth?: boolean;
  modalMode?: boolean;
  timeouts?: {
    authentication?: number;
    polling?: number;
  };
  encryptionKey?: string;
  enableMobileWallet?: boolean;
  mobileWalletScheme?: string;
  debug?: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  config?: Partial<CapAuthConfig>;
  onAuthSuccess?: (user: User) => void;
  onAuthError?: (error: Error) => void;
}

export interface CapAuthProps {
  onAuthenticated: (user: User) => void;
  config: CapAuthConfig;
  onError?: (error: Error) => void;
}

// Auth hooks and components
export function useAuth(): {
  user: User | null;
  isAuthenticated: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  logout: () => void;
};

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P>;

export function AuthProvider(props: AuthProviderProps): JSX.Element;
export function CapAuth(props: CapAuthProps): JSX.Element;

// Server namespace with all server-related types and functions
export namespace server {
  export interface DatabaseInterface {
    initialize(): Promise<void>;
    findUser(walletAddress: string): Promise<User | null>;
    createUser(userData: NewUserData): Promise<User>;
    updateUser(walletAddress: string, updates: Partial<User>): Promise<User | null>;
    deleteUser(walletAddress: string): Promise<boolean>;
    close(): Promise<void>;
  }

  export function createAuthHandler(config?: {
    customValidation?: (walletAddress: string) => Promise<boolean>;
    validateUser?: (walletAddress: string) => Promise<User | null>;
    onNewUser?: (user: NewUserData) => Promise<void>;
    dbPath?: string;
  }): {
    GET: () => Promise<Response>;
    POST: (req: Request) => Promise<Response>;
  };

  export class EncryptedJSONDatabase implements DatabaseInterface {
    static getInstance(dbPath?: string): EncryptedJSONDatabase;
    initialize(): Promise<void>;
    findUser(walletAddress: string): Promise<User | null>;
    createUser(userData: NewUserData): Promise<User>;
    updateUser(walletAddress: string, updates: Partial<User>): Promise<User | null>;
    deleteUser(walletAddress: string): Promise<boolean>;
    close(): Promise<void>;
  }

  export const db: EncryptedJSONDatabase;
  
  /**
   * Gets available roles from USER_ROLES environment variable
   * @returns Array of role strings
   */
  export function getAvailableRoles(): string[];
  
  /**
   * Gets the default role from DEFAULT_USER_ROLE environment variable
   * @returns Default role string
   */
  export function getDefaultRole(): string;
  
  /**
   * Validates if a role exists in available roles
   * @param role Role to validate
   * @returns Boolean indicating if role is valid
   */
  export function isValidRole(role: string): boolean;
}

// Vue components
export namespace vue {
  export const VueCapAuth: {
    mount: (
      element: HTMLElement, 
      options: {
        config: CapAuthConfig;
        onAuthenticated: (user: User) => void;
        onError?: (error: Error) => void;
      }
    ) => () => void;
    directive: any;
  };
}