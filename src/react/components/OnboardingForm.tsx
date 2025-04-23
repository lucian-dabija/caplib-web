import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { User, UserDetails } from '../../types';
import {
    Card,
    Button,
    Input,
    Label,
    Select,
    Option,
    Tabs,
    TabsHeader,
    TabsContent,
    Tab,
    TabPanel
} from './ui';

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
    customStyles = {}
}: OnboardingFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accountType, setAccountType] = useState<AccountType>('human');

    const [details, setDetails] = useState<UserDetails>({
        first_name: '',
        last_name: '',
        entity_name: '',
        email: '',
        role: 'User'
    });

    const handleDetailsChange = <K extends keyof UserDetails>(
        key: K,
        value: UserDetails[K]
    ) => {
        setDetails(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create different payload based on account type
            const payload = {
                wallet_address: walletAddress,
                ...details,
                first_name: accountType === 'human' ? details.first_name : details.entity_name,
                last_name: accountType === 'human' ? details.last_name : 'ENTITY',
                entity_name: accountType === 'entity' ? details.entity_name : undefined,
                email: details.email,
                role: details.role,
                account_type: accountType
            };

            const createResponse = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create profile');
            }

            const data = await createResponse.json();
            onComplete(data.user);
        } catch (error) {
            console.error('Registration error:', error);
            setError(error instanceof Error ? error.message : 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`w-full max-w-md p-6 backdrop-blur-lg bg-white/10 ${customStyles.card || ''}`}>
            <div className="absolute bottom-2 right-2 w-24 h-10 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" className="text-white">
                    <path d="M20 15h160v50H20z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <text x="100" y="45" textAnchor="middle" fill="currentColor"
                        className="text-sm font-bold">CAPLIB</text>
                </svg>
            </div>

            <div className="text-center mb-6">
                <h1 className={`text-3xl font-bold bg-gradient-to-r from-${theme.primary}-400 to-${theme.secondary}-400 bg-clip-text text-transparent`}>
                    Complete Your Profile
                </h1>
                <p className="text-white/70 mt-2">
                    Tell us a bit about yourself
                </p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/10 rounded-lg"
                >
                    <p className="text-sm text-red-400 text-center">{error}</p>
                </motion.div>
            )}

            <Tabs defaultTab="human" onChange={(value) => setAccountType(value as AccountType)}>
                <TabsHeader>
                    <Tab id="human">Human</Tab>
                    <Tab id="entity">Entity</Tab>
                </TabsHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <TabsContent>
                        <TabPanel id="human">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={details.first_name}
                                        onChange={(e) => handleDetailsChange('first_name', e.target.value)}
                                        className={`bg-white/5 border-white/10 text-white ${customStyles.input}`}
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={details.last_name}
                                        onChange={(e) => handleDetailsChange('last_name', e.target.value)}
                                        className={`bg-white/5 border-white/10 text-white ${customStyles.input}`}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel id="entity">
                            <div>
                                <Label htmlFor="entityName">Entity Name</Label>
                                <Input
                                    id="entityName"
                                    value={details.entity_name}
                                    onChange={(e) => handleDetailsChange('entity_name', e.target.value)}
                                    className={`bg-white/5 border-white/10 text-white ${customStyles.input}`}
                                    placeholder="Company or Organization Name"
                                />
                            </div>
                        </TabPanel>
                    </TabsContent>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={details.email}
                            onChange={(e) => handleDetailsChange('email', e.target.value)}
                            className={`bg-white/5 border-white/10 text-white ${customStyles.input}`}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                            id="role"
                            value={details.role}
                            onChange={(e) => handleDetailsChange('role', e.target.value)}
                            className={customStyles.select}
                        >
                            <Option value="User">User</Option>
                            <Option value="Administrator">Administrator</Option>
                            <Option value="Developer">Developer</Option>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={onBack}
                            className="flex-1 border border-white/10 hover:bg-white/5 text-white"
                            disabled={loading}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className={`flex-1 bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 text-white ${customStyles.button}`}
                            disabled={loading}
                        >
                            {loading ? "Please wait..." : "Complete"}
                        </Button>
                    </div>
                </form>
            </Tabs>
        </Card>
    );
}