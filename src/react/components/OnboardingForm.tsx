import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Text,
    VStack,
    useToast,
    FormErrorMessage,
    Image,
} from '@chakra-ui/react';
import type { User, UserDetails } from '../../types';

// Import the logo directly
// This will be bundled with the library during build
import ZeroCatLogo from '../assets/zerocat-logo';

interface OnboardingFormProps {
    walletAddress: string;
    onComplete: (user: User) => void;
    onBack: () => void;
    theme?: {
        primary: string;
        secondary: string;
    };
    customStyles?: {
        container?: string;
        card?: string;
        button?: string;
        input?: string;
        select?: string;
    };
}

type AccountType = 'human' | 'entity';

export function OnboardingForm({
    walletAddress,
    onComplete,
    onBack,
    theme = { primary: 'blue', secondary: 'teal' },
}: OnboardingFormProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState<AccountType>('human');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [availableRoles, setAvailableRoles] = useState<string[]>(['User']);
    const [defaultRole, setDefaultRole] = useState<string>('User');

    const [details, setDetails] = useState<UserDetails>({
        first_name: '',
        last_name: '',
        entity_name: '',
        email: '',
        role: 'User',
    });

    // Fetch available roles from the API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch('/api/roles');
                if (response.ok) {
                    const data = await response.json();
                    if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
                        setAvailableRoles(data.roles);
                        
                        if (data.defaultRole) {
                            setDefaultRole(data.defaultRole);
                            setDetails(prev => ({
                                ...prev,
                                role: data.defaultRole
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch roles:', error);
                // Fall back to hardcoded roles
            }
        };

        fetchRoles();
    }, []);

    const handleDetailsChange = <K extends keyof UserDetails>(
        key: K,
        value: UserDetails[K]
    ) => {
        setDetails((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (errors[key]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (accountType === 'human') {
            if (!details.first_name.trim()) {
                newErrors.first_name = 'First name is required';
            }
            if (!details.last_name.trim()) {
                newErrors.last_name = 'Last name is required';
            }
        } else {
            if (!details.entity_name.trim()) {
                newErrors.entity_name = 'Entity name is required';
            }
        }

        if (!details.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(details.email)) {
            newErrors.email = 'Email is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                wallet_address: walletAddress,
                first_name: accountType === 'human' ? details.first_name : '',
                last_name: accountType === 'human' ? details.last_name : 'ENTITY',
                entity_name: accountType === 'entity' ? details.entity_name : '',
                email: details.email,
                role: details.role,
                account_type: accountType,
            };

            const createResponse = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create profile');
            }

            const data = await createResponse.json();
            onComplete(data.user);

            toast({
                title: 'Profile created',
                description: 'Your profile has been successfully created.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Registration error:', error);

            toast({
                title: 'Registration failed',
                description: error instanceof Error ? error.message : 'Failed to create account',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box width="100%" p={6} position="relative">
            <VStack spacing={6} align="stretch">
                <Box textAlign="center" mb={6}>
                    <Flex justifyContent="center" mb={4}>
                        <Image 
                            src={ZeroCatLogo} 
                            alt="ZEROCAT" 
                            height="32px"
                            width="80px"
                            objectFit="contain"
                        />
                    </Flex>
                    <Heading
                        as="h1"
                        size="xl"
                        bgGradient={`linear(to-r, ${theme.primary}.400, ${theme.secondary}.400)`}
                        backgroundClip="text"
                        mb={2}
                    >
                        Complete Your Profile
                    </Heading>
                    <Text color="whiteAlpha.700">Tell us a bit about yourself</Text>
                </Box>

                <form onSubmit={handleSubmit}>
                    <VStack spacing={6} align="stretch">
                        <FormControl as="fieldset">
                            <FormLabel as="legend" fontWeight="medium">
                                Account Type
                            </FormLabel>
                            <RadioGroup
                                defaultValue="human"
                                onChange={(value: string) => setAccountType(value as AccountType)}
                                value={accountType}
                            >
                                <Stack direction="row" spacing={5}>
                                    <Radio value="human">Individual</Radio>
                                    <Radio value="entity">Entity/Organization</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        {accountType === 'human' ? (
                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                                <FormControl isInvalid={!!errors.first_name}>
                                    <FormLabel>First Name</FormLabel>
                                    <Input
                                        value={details.first_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDetailsChange('first_name', e.target.value)}
                                        placeholder="John"
                                    />
                                    <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!errors.last_name}>
                                    <FormLabel>Last Name</FormLabel>
                                    <Input
                                        value={details.last_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDetailsChange('last_name', e.target.value)}
                                        placeholder="Doe"
                                    />
                                    <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                                </FormControl>
                            </Stack>
                        ) : (
                            <FormControl isInvalid={!!errors.entity_name}>
                                <FormLabel>Organization Name</FormLabel>
                                <Input
                                    value={details.entity_name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDetailsChange('entity_name', e.target.value)}
                                    placeholder="Company or Organization Name"
                                />
                                <FormErrorMessage>{errors.entity_name}</FormErrorMessage>
                            </FormControl>
                        )}

                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={details.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDetailsChange('email', e.target.value)}
                                placeholder="you@example.com"
                            />
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Role</FormLabel>
                            <Select
                                value={details.role}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleDetailsChange('role', e.target.value)}
                            >
                                {availableRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <Flex gap={3} pt={4}>
                            <Button
                                flex="1"
                                variant="outline"
                                onClick={onBack}
                                isDisabled={loading}
                            >
                                Back
                            </Button>
                            <Button
                                flex="1"
                                variant="gradient"
                                type="submit"
                                isLoading={loading}
                                loadingText="Creating..."
                            >
                                Complete
                            </Button>
                        </Flex>
                    </VStack>
                </form>
            </VStack>
            
            {/* Footer with ZEROCAT branding */}
            <Flex 
                justifyContent="center" 
                alignItems="center" 
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                p={2}
                borderTop="1px"
                borderColor="whiteAlpha.100"
                bg="whiteAlpha.50"
            >
                <Text fontSize="xs" color="whiteAlpha.600" mr={1}>Powered by</Text>
                <Image
                    src={ZeroCatLogo}
                    alt="ZEROCAT"
                    height="12px"
                    width="28px"
                />
            </Flex>
        </Box>
    );
}