import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    ChakraProvider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react';
import { CapAuth } from './CapAuth';
import type { User, CapAuthConfig, AuthProviderProps } from '../../types';
import capAuthTheme from '../theme';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    showAuthModal: () => void;
    hideAuthModal: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    config = {},
    onAuthSuccess,
    onAuthError,
}: AuthProviderProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [user, setUser] = useState<User | null>(null);

    const defaultConfig: CapAuthConfig = {
        appName: "Secure Authentication",
        appDescription: "Login securely with your wallet",
        theme: {
            primary: "blue",
            secondary: "teal"
        },
        refreshPageOnAuth: false,
        timeouts: {
            authentication: 300000,
            polling: 3000
        },
        enableMobileWallet: true,
        mobileWalletScheme: "zerowallet://",
        ...config
    };

    useEffect(() => {
        const checkAuth = async () => {
            const walletAddress = localStorage.getItem('wallet_address');
            if (walletAddress) {
                try {
                    const response = await fetch('/api/users/active', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ wallet_address: walletAddress })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                    } else {
                        localStorage.removeItem('wallet_address');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                }
            }
        };

        checkAuth();
    }, []);

    const handleAuthenticated = async (authenticatedUser: User) => {
        setUser(authenticatedUser);
        localStorage.setItem('wallet_address', authenticatedUser.wallet_address);
        onClose();

        if (onAuthSuccess) {
            onAuthSuccess(authenticatedUser);
        }

        if (defaultConfig.refreshPageOnAuth) {
            window.location.reload();
        } else if (defaultConfig.redirectPath) {
            window.location.href = defaultConfig.redirectPath;
        }
    };

    const handleError = (error: Error) => {
        console.error('Authentication error:', error);
        if (onAuthError) {
            onAuthError(error);
        }
    };

    const showAuthModal = () => onOpen();
    const hideAuthModal = () => onClose();

    const logout = () => {
        localStorage.removeItem('wallet_address');
        setUser(null);
    };

    const contextValue: AuthContextType = {
        user,
        isAuthenticated: !!user,
        showAuthModal,
        hideAuthModal,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            <ChakraProvider theme={capAuthTheme}>
                {children}

                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                    isCentered
                    size="md"
                    closeOnOverlayClick={false}
                >
                    <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
                    <ModalContent
                        bg="transparent"
                        boxShadow="none"
                        width="auto"
                        maxWidth="100%"
                        margin="0"
                    >
                        <ModalCloseButton
                            color="white"
                            zIndex="popover"
                            position="absolute"
                            right="4px"
                            top="4px"
                        />
                        <ModalBody p={0} display="flex" justifyContent="center">
                            <CapAuth
                                onAuthenticated={handleAuthenticated}
                                config={defaultConfig}
                                onError={handleError}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </ChakraProvider>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    return function WithAuthComponent(props: P) {
        const { isAuthenticated, showAuthModal } = useAuth();

        useEffect(() => {
            if (!isAuthenticated) {
                showAuthModal();
            }
        }, [isAuthenticated]);

        return <WrappedComponent {...props} />;
    };
}