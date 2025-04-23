'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import type { CapAuthProps, User } from '../../types';
import { OnboardingForm } from './OnboardingForm';
import { Card, Button } from './ui';
import { fadeIn, slideUp } from '../utils';

export function CapAuth({
    onAuthenticated,
    config,
    onError
}: CapAuthProps) {
    const [stage, setStage] = useState<'intro' | 'qr' | 'polling' | 'onboarding'>('intro');
    const [qrData, setQrData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nonce, setNonce] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [isPollingActive, setIsPollingActive] = useState(true);

    const cleanupTimers = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
    };

    useEffect(() => {
        return () => cleanupTimers();
    }, []);

    useEffect(() => {
        if (stage === 'polling' && nonce && isPollingActive) {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nonce }),
                    });

                    if (!response.ok) throw new Error('Verification failed');

                    const data = await response.json();
                    if (data.authenticated && data.userAddress) {
                        cleanupTimers();
                        if (data.user) {
                            onAuthenticated(data.user);
                        } else {
                            setWalletAddress(data.userAddress);
                            setStage('onboarding');
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, config.timeouts?.polling || 3000);

            setPollingInterval(interval);

            const timeout = setTimeout(() => {
                cleanupTimers();
                setError('Authentication timeout. Please try again.');
                setStage('intro');
            }, config.timeouts?.authentication || 300000);

            setTimeoutId(timeout);

            return () => cleanupTimers();
        }
    }, [stage, nonce, onAuthenticated, isPollingActive, config]);

    const generateQR = async () => {
        try {
            setError(null);
            const response = await fetch('/api/auth');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate authentication code');
            }

            const receiverAddr = process.env.NEXT_PUBLIC_SERVER_WALLET_ADDRESS || '';
            const txDetails = `smart_contract_auth_${process.env.NEXT_PUBLIC_AUTH_CONTRACT_ID},nonce_${data.nonce}`;

            const qrData = `amount=0,recipientAddress=${receiverAddr},senderAddress=customer_,timestamp=${new Date().toISOString()},tokenId=${process.env.NEXT_PUBLIC_TOKEN_ID},transactionCost=0,transactionDetails=${txDetails},transactionId=transaction_`;

            setQrData(qrData);
            setNonce(data.nonce);
            setStage('qr');
        } catch (error) {
            console.error('QR generation error:', error);
            setError('Failed to generate authentication code. Please try again.');
            if (onError && error instanceof Error) {
                onError(error);
            }
        }
    };

    const handleOpenMobileWallet = () => {
        const walletScheme = config.mobileWalletScheme || 'capwallet://';
        if (config.enableMobileWallet && qrData) {
            window.location.href = `${walletScheme}authenticate?${encodeURIComponent(qrData)}`;
        }
    };

    const handleRetry = () => {
        cleanupTimers();
        setError(null);
        setQrData(null);
        setNonce(null);
        setWalletAddress(null);
        setStage('intro');
        setIsPollingActive(true);
    };

    const handleOnboardingComplete = (user: User) => {
        if (walletAddress) {
            onAuthenticated(user);
        }
    };

    const {
        theme = { primary: 'blue', secondary: 'teal' },
        customStyles = {}
    } = config;

    return (
        <Card className={`w-full max-w-md p-6 backdrop-blur-lg bg-white/10 ${customStyles.card || ''}`}>
            <div className="absolute bottom-2 right-2 w-24 h-10 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" className="text-white">
                    <path d="M20 15h160v50H20z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <text x="100" y="45" textAnchor="middle" fill="currentColor"
                        className="text-sm font-bold">CAPLIB</text>
                </svg>
            </div>

            <AnimatePresence mode="wait">
                {stage === 'intro' && (
                    <motion.div
                        key="intro"
                        variants={slideUp}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h1 className={`text-3xl font-bold bg-gradient-to-r from-${theme.primary}-400 to-${theme.secondary}-400 bg-clip-text text-transparent`}>
                                {config.appName}
                            </h1>
                            <p className="text-white/70">
                                {config.appDescription}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mt-1 shrink-0">
                                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                                    <path d="M12 18h.01" />
                                </svg>
                                <div>
                                    <h3 className="font-medium text-white">Get Your Wallet Ready</h3>
                                    <p className="text-sm text-white/70">
                                        Ensure you have your CapWallet installed and ready
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400 mt-1 shrink-0">
                                    <rect width="18" height="18" x="3" y="3" rx="2" />
                                    <path d="M7 7h.01M12 7h.01M17 7h.01M7 12h.01M12 12h.01M17 12h.01M7 17h.01M12 17h.01M17 17h.01" />
                                </svg>
                                <div>
                                    <h3 className="font-medium text-white">Credentialless Auth</h3>
                                    <p className="text-sm text-white/70">
                                        Scan QR code with your wallet for secure login
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className={`w-full bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 text-white ${customStyles.button}`}
                            onClick={generateQR}
                        >
                            Start Authentication
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </Button>
                    </motion.div>
                )}

                {stage === 'qr' && qrData && (
                    <motion.div
                        key="qr"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-white">Scan QR Code</h2>
                            <p className="text-sm text-white/70">
                                Open your wallet app and scan this code
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-xl shadow-xl">
                                <QRCodeSVG
                                    value={qrData}
                                    size={256}
                                    level="M"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            {config.enableMobileWallet && (
                                <Button
                                    variant="outline"
                                    onClick={handleOpenMobileWallet}
                                    className={`w-full ${customStyles.button}`}
                                >
                                    Open in Mobile Wallet
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                                        <path d="M12 18h.01" />
                                    </svg>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                onClick={() => setStage('polling')}
                                className={`w-full ${customStyles.button}`}
                            >
                                I've Completed the Transaction
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </Button>
                        </div>
                    </motion.div>
                )}

                {stage === 'polling' && (
                    <motion.div
                        key="polling"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-6 text-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin mx-auto text-white">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Verifying</h2>
                            <p className="text-sm text-white/70 mt-2">
                                Please wait while we confirm your transaction...
                            </p>
                        </div>
                    </motion.div>
                )}

                {stage === 'onboarding' && walletAddress && (
                    <motion.div
                        key="onboarding"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <OnboardingForm
                            walletAddress={walletAddress}
                            onComplete={handleOnboardingComplete}
                            onBack={handleRetry}
                            theme={theme}
                            customStyles={customStyles}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-500/10 rounded-lg"
                >
                    <p className="text-sm text-red-400 text-center">{error}</p>
                    <Button
                        variant="outline"
                        className="w-full mt-2 text-white"
                        onClick={handleRetry}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                            <path d="M8 16H3v5" />
                        </svg>
                        Try Again
                    </Button>
                </motion.div>
            )}
        </Card>
    );
}