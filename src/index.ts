export {
    AuthProvider,
    useAuth,
    withAuth
} from './react/components/AuthProvider';

export type {
    User,
    UserDetails,
    NewUserData,
    CapAuthConfig,
    AuthResponse,
    AuthProviderProps,
    CapAuthProps
} from './types';

export { createAuthHandler } from './server/handlers/wallet-auth';