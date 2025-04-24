'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Box,
    Button,
    Center,
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Image,
    Spinner,
    Step,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    Text,
    useSteps,
    VStack,
    useToast,
} from '@chakra-ui/react';
import { PhoneIcon, CheckIcon, CloseIcon, RepeatIcon } from '@chakra-ui/icons';
import type { CapAuthProps, User } from '../../types';
import { OnboardingForm } from './OnboardingForm';


const ZeroCatLogo = require('../../../zerocat.png');

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

const slideRight = {
    hidden: { x: -30, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: { x: 30, opacity: 0, transition: { duration: 0.3 } },
};

const steps = [
    { title: 'Prepare' },
    { title: 'Scan' },
    { title: 'Verify' },
    { title: 'Profile' },
];

export function CapAuth({
    onAuthenticated,
    config,
    onError,
}: CapAuthProps) {
    const toast = useToast();
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const [stage, setStage] = useState<'intro' | 'qr' | 'polling' | 'onboarding'>('intro');
    const [qrData, setQrData] = useState<string | null>(null);
    const [qrUri, setQrUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [nonce, setNonce] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isPollingActive, setIsPollingActive] = useState(true);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const isAuthenticatedRef = useRef<boolean>(false);

    const cleanupTimers = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
    };

    useEffect(() => {
        return () => cleanupTimers();
    }, []);

    useEffect(() => {
        if (stage === 'polling' && nonce && isPollingActive && !isAuthenticatedRef.current) {
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
                        isAuthenticatedRef.current = true;
                        setIsPollingActive(false);
                        cleanupTimers();

                        if (data.user) {
                            onAuthenticated(data.user);
                            toast({
                                title: "Authentication successful",
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                            });
                        } else {
                            setActiveStep(3);
                            setWalletAddress(data.userAddress);
                            setStage('onboarding');
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, config.timeouts?.polling || 3000);

            pollingIntervalRef.current = interval;

            const timeout = setTimeout(() => {
                cleanupTimers();
                setError('Authentication timeout. Please try again.');
                setStage('intro');
                setActiveStep(0);
            }, config.timeouts?.authentication || 300000);

            timeoutIdRef.current = timeout;

            return () => cleanupTimers();
        }
    }, [stage, nonce, isPollingActive, config, onAuthenticated, toast, setActiveStep]);

    const generateQR = async () => {
        try {
            setError(null);
            setActiveStep(1);

            const response = await fetch('/api/auth');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate authentication code');
            }

            const receiverAddr = process.env.NEXT_PUBLIC_SERVER_WALLET_ADDRESS || '';
            const contractId = process.env.NEXT_PUBLIC_AUTH_CONTRACT_ID || '';
            const tokenId = process.env.NEXT_PUBLIC_TOKEN_ID || '';

            const txDetails = `smart_contract_auth_${contractId},nonce_${data.nonce}`;

            const txParams = `amount=0,recipientAddress=${receiverAddr},senderAddress=customer_,timestamp=${new Date().toISOString()},tokenId=${tokenId},transactionCost=0,transactionDetails=${txDetails},transactionId=transaction_`;

            setQrData(txParams);
            setQrUri(`zerowallet://transaction?${txParams}`);
            setNonce(data.nonce);
            setStage('qr');
        } catch (error) {
            console.error('QR generation error:', error);
            setError('Failed to generate authentication code. Please try again.');

            toast({
                title: "Error",
                description: "Failed to generate authentication code. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });

            if (onError && error instanceof Error) {
                onError(error);
            }
        }
    };

    const handleOpenMobileWallet = () => {
        if (config.enableMobileWallet && qrUri) {
            window.location.href = qrUri;
        }
    };

    const proceedToVerification = () => {
        setActiveStep(2);
        setStage('polling');
        setIsPollingActive(true);
    };

    const handleRetry = () => {
        cleanupTimers();
        setError(null);
        setQrData(null);
        setQrUri(null);
        setNonce(null);
        setWalletAddress(null);
        setStage('intro');
        setActiveStep(0);
        setIsPollingActive(true);
        isAuthenticatedRef.current = false;
    };

    const handleOnboardingComplete = (user: User) => {
        setIsPollingActive(false);
        isAuthenticatedRef.current = true;

        if (walletAddress) {
            onAuthenticated(user);
            toast({
                title: "Profile completed",
                description: "You're now successfully signed in.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const {
        theme = { primary: 'blue', secondary: 'teal' },
    } = config;

    return (
        <Box
            width={{ base: "90vw", sm: "100%" }}
            maxW="md"
            borderRadius="xl"
            overflow="hidden"
            bg="dark.200"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            boxShadow="xl"
            position="relative"
        >
            <Box p={{ base: 2, sm: 4 }} bg="whiteAlpha.50">
                <Stepper index={activeStep} colorScheme="brand" size="sm">
                    {steps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus
                                    complete={<StepIcon />}
                                    incomplete={<StepNumber />}
                                    active={<StepNumber />}
                                />
                            </StepIndicator>
                            <Box flexShrink={0}>
                                <StepTitle fontSize={{ base: "xs", sm: "sm" }}>{step.title}</StepTitle>
                            </Box>
                            <StepSeparator />
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <AnimatePresence mode="wait">
                {stage === 'intro' && (
                    <motion.div
                        key="intro"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <VStack spacing={{ base: 4, sm: 6 }} p={{ base: 4, sm: 6 }}>
                            <Box textAlign="center">
                                <Heading
                                    as="h1"
                                    size={{ base: "lg", sm: "xl" }}
                                    bgGradient={`linear(to-r, ${theme.primary}.400, ${theme.secondary}.400)`}
                                    backgroundClip="text"
                                    mb={2}
                                >
                                    {config.appName}
                                </Heading>
                                <Text color="whiteAlpha.700" fontSize={{ base: "sm", sm: "md" }}>
                                    {config.appDescription}
                                </Text>
                            </Box>

                            <VStack spacing={4} w="full">
                                <Flex
                                    align="flex-start"
                                    gap={4}
                                    p={4}
                                    bg="whiteAlpha.50"
                                    borderRadius="lg"
                                    w="full"
                                >
                                    <Box color="blue.400" mt={1}>
                                        <PhoneIcon boxSize={{ base: 4, sm: 5 }} />
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" fontSize={{ base: "sm", sm: "md" }}>Get Your Wallet Ready</Text>
                                        <Text fontSize={{ base: "xs", sm: "sm" }} color="whiteAlpha.700">
                                            Ensure you have ZeroWallet installed and ready
                                        </Text>
                                    </Box>
                                </Flex>

                                <Flex
                                    align="flex-start"
                                    gap={4}
                                    p={4}
                                    bg="whiteAlpha.50"
                                    borderRadius="lg"
                                    w="full"
                                >
                                    <Box color="teal.400" mt={1}>
                                        <Icon
                                            viewBox="0 0 24 24"
                                            boxSize={{ base: 4, sm: 5 }}
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v4h-4v2h4v4h2v-4h4v-2h-4v-4z"
                                            />
                                        </Icon>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="medium" fontSize={{ base: "sm", sm: "md" }}>Credentialless Auth</Text>
                                        <Text fontSize={{ base: "xs", sm: "sm" }} color="whiteAlpha.700">
                                            Scan QR code with your phone to open ZeroWallet
                                        </Text>
                                    </Box>
                                </Flex>
                            </VStack>

                            <Button
                                w="full"
                                variant="gradient"
                                size={{ base: "md", sm: "lg" }}
                                onClick={generateQR}
                                rightIcon={<Icon viewBox="0 0 24 24" boxSize={{ base: 4, sm: 5 }}>
                                    <path
                                        fill="currentColor"
                                        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
                                    />
                                </Icon>}
                            >
                                Start Authentication
                            </Button>
                        </VStack>
                    </motion.div>
                )}

                {stage === 'qr' && qrData && (
                    <motion.div
                        key="qr"
                        variants={slideRight}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <VStack spacing={{ base: 4, sm: 6 }} p={{ base: 4, sm: 6 }}>
                            <Box textAlign="center">
                                <Heading as="h2" size={{ base: "md", sm: "lg" }} mb={2}>Scan QR Code</Heading>
                                <Text color="whiteAlpha.700" fontSize={{ base: "xs", sm: "sm" }}>
                                    Open your camera app and scan this code
                                </Text>
                            </Box>

                            <Center py={{ base: 4, sm: 6 }}>
                                <Box p={{ base: 3, sm: 4 }} bg="white" borderRadius="xl" boxShadow="xl">
                                    <QRCodeSVG
                                        value={qrUri || ''}
                                        size={Math.min(220, window.innerWidth * 0.6)}
                                        level="M"
                                        includeMargin={true}
                                    />
                                </Box>
                            </Center>

                            <VStack spacing={4} w="full">
                                {config.enableMobileWallet && (
                                    <Button
                                        w="full"
                                        variant="outline"
                                        onClick={handleOpenMobileWallet}
                                        leftIcon={<PhoneIcon />}
                                        size={{ base: "sm", sm: "md" }}
                                    >
                                        Open in ZeroWallet
                                    </Button>
                                )}

                                <Button
                                    w="full"
                                    variant="gradient"
                                    onClick={proceedToVerification}
                                    rightIcon={<CheckIcon />}
                                    size={{ base: "sm", sm: "md" }}
                                >
                                    I've Completed the Transaction
                                </Button>
                            </VStack>
                        </VStack>
                    </motion.div>
                )}

                {stage === 'polling' && (
                    <motion.div
                        key="polling"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <VStack spacing={6} p={{ base: 6, sm: 8 }} textAlign="center">
                            <Spinner
                                thickness="4px"
                                speed="0.65s"
                                emptyColor="whiteAlpha.200"
                                color="brand.500"
                                size={{ base: "lg", sm: "xl" }}
                            />

                            <Box>
                                <Heading as="h2" size={{ base: "md", sm: "lg" }} mb={2}>Verifying</Heading>
                                <Text color="whiteAlpha.700" fontSize={{ base: "sm", sm: "md" }}>
                                    Please wait while we confirm your transaction...
                                </Text>
                            </Box>
                        </VStack>
                    </motion.div>
                )}

                {stage === 'onboarding' && walletAddress && (
                    <motion.div
                        key="onboarding"
                        variants={slideRight}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <OnboardingForm
                            walletAddress={walletAddress}
                            onComplete={handleOnboardingComplete}
                            onBack={handleRetry}
                            theme={theme}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Box p={{ base: 3, sm: 4 }} bg="red.900" color="white" mt={2}>
                        <VStack spacing={{ base: 3, sm: 4 }}>
                            <Text color="red.200" textAlign="center" fontSize={{ base: "sm", sm: "md" }}>{error}</Text>
                            <Button
                                leftIcon={<RepeatIcon />}
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                            >
                                Try Again
                            </Button>
                        </VStack>
                    </Box>
                </motion.div>
            )}

            <Flex
                justifyContent="center"
                alignItems="center"
                p={2}
                borderTop="1px"
                borderColor="whiteAlpha.100"
                bg="whiteAlpha.50"
            >
                <Text fontSize="xs" color="whiteAlpha.600" mr={1}>Powered by</Text>
                <Image
                    src={ZeroCatLogo}
                    alt="ZEROCAT"
                    height={{ base: "10px", sm: "12px" }}
                    width={{ base: "24px", sm: "28px" }}
                />
            </Flex>
        </Box>
    );
}