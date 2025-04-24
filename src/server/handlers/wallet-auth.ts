import { NextRequest } from 'next/server';
import type { AuthHandlerConfig, AuthResponse, NonceResponse } from '../../types';
import { EncryptedJSONDatabase } from '../db/encrypted-json-db';

const getEnvVariable = (name: string, fallbackName?: string): string => {
    let value = process.env[name];
    if (!value && fallbackName) {
        value = process.env[fallbackName];
    }
    
    if (!value) {
        throw new Error(`Required environment variable ${name}${fallbackName ? ` or ${fallbackName}` : ''} is not set`);
    }
    return value;
};

export const createAuthHandler = (config?: AuthHandlerConfig) => {
    const db = EncryptedJSONDatabase.getInstance();
    let isInitialized = false;

    const initialize = async () => {
        if (!isInitialized) {
            try {
                await db.initialize();
                isInitialized = true;
            } catch (error) {
                console.error('Failed to initialize database:', error);
            }
        }
    };

    const GET = async (): Promise<Response> => {
        try {
            const API_URL = getEnvVariable('CAPLIB_API_URL');
            const API_KEY = getEnvVariable('CAPLIB_API_KEY');
            // Use NEXT_PUBLIC_AUTH_CONTRACT_ID if AUTH_CONTRACT_ID is not available
            const CONTRACT_ID = getEnvVariable('NEXT_PUBLIC_AUTH_CONTRACT_ID', 'AUTH_CONTRACT_ID');

            await initialize();

            const response = await fetch(`${API_URL}?action=generateNonce&contractId=${CONTRACT_ID}`, {
                headers: { 'X-API-Key': API_KEY },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return new Response(
                JSON.stringify({ nonce: data.nonce } as NonceResponse),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        } catch (error) {
            console.error('Error generating nonce:', error);

            return new Response(
                JSON.stringify({ error: 'Failed to generate nonce', nonce: '' } as NonceResponse),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    };

    const POST = async (req: NextRequest): Promise<Response> => {
        try {
            const API_URL = getEnvVariable('CAPLIB_API_URL');
            const API_KEY = getEnvVariable('CAPLIB_API_KEY');
            // Use NEXT_PUBLIC_AUTH_CONTRACT_ID if AUTH_CONTRACT_ID is not available
            const CONTRACT_ID = getEnvVariable('NEXT_PUBLIC_AUTH_CONTRACT_ID', 'AUTH_CONTRACT_ID');

            await initialize();

            const body = await req.json();
            const { nonce, userData } = body;

            const verifyResponse = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'verifyAuthentication',
                    contractId: CONTRACT_ID,
                    nonce: nonce,
                }),
            });

            if (!verifyResponse.ok) {
                throw new Error(`Verification failed: ${verifyResponse.status}`);
            }

            const verifyData = await verifyResponse.json();
            const { authenticated, userAddress } = verifyData;

            if (!authenticated || !userAddress) {
                return new Response(
                    JSON.stringify({
                        authenticated: false,
                        error: 'Authentication failed'
                    } as AuthResponse),
                    {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }

            if (config?.customValidation) {
                const isValid = await config.customValidation(userAddress);
                if (!isValid) {
                    return new Response(
                        JSON.stringify({
                            authenticated: false,
                            error: 'Custom validation failed'
                        } as AuthResponse),
                        {
                            status: 403,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );
                }
            }

            try {
                let user = await db.findUser(userAddress);

                if (!user && userData) {
                    user = await db.createUser({
                        wallet_address: userAddress,
                        ...userData
                    });
                }

                return new Response(
                    JSON.stringify({
                        authenticated: true,
                        userAddress,
                        user: user || undefined
                    } as AuthResponse),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            } catch (error) {
                console.error('Database error:', error);
                return new Response(
                    JSON.stringify({
                        authenticated: true,
                        userAddress,
                        error: 'Database operation failed'
                    } as AuthResponse),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }
        } catch (error) {
            console.error('Error verifying authentication:', error);

            return new Response(
                JSON.stringify({
                    authenticated: false,
                    error: 'Authentication verification failed'
                } as AuthResponse),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    };

    return { GET, POST };
};