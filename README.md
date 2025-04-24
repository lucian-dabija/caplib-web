# CapLib | Credentialless Authentication Protocol from ZEROCAT | Powered by ZeroBrix blockchain technology

![CapLib Banner](./banner.png)

A modern, secure, and easy-to-use credentialless authentication library for web applications. Works with React, Next.js, Vue.js and other frameworks with a beautiful blockchain-based authentication flow.

## Features At a Glance

- 🎨 **Beautiful Modal UI**: Clean design with smooth animations
- 🔐 **Secure Authentication**: QR code-based blockchain authentication
- 🔒 **Encrypted Storage**: Built-in encrypted JSON database
- 📱 **Mobile Ready**: Optional mobile wallet integration
- 🔄 **Simple Onboarding**: Quick user registration flow
- ⚡ **Zero Config**: No manual route setup needed
- 🎯 **Simple Integration**: Just wrap your components
- 🌐 **Framework Agnostic**: Works with React, Vue, and more
- 🔑 **Credentialless**: No usernames or passwords to manage

## Installation

```bash
# Using npm
npm install caplib

# Using yarn
yarn add caplib

# Using pnpm
pnpm add caplib
```

## Quick Start Guide

### 1. Environment Variables

Create or update `.env.local` in your project root:

```env
# Required: API Configuration
CAPLIB_API_URL=https://brix.zerocat.one/api/v2
CAPLIB_API_KEY=your_api_key
AUTH_CONTRACT_ID=your_contract_id

# Required: Public Variables
NEXT_PUBLIC_SERVER_WALLET_ADDRESS=your_wallet_address
NEXT_PUBLIC_TOKEN_ID=your_token_id

# Optional: Database Encryption
DB_ENCRYPTION_KEY=your_random_32_byte_hex_string
```

### 2. Create Auth API Route (Next.js)

Create `app/api/auth/route.ts`:

```typescript
import { createAuthHandler } from 'caplib';

// Important for Next.js dynamic routes
export const dynamic = 'force-dynamic';

// Export the authentication handlers
export const { GET, POST } = createAuthHandler({
  // Optional: Add custom validation
  customValidation: async (walletAddress: string) => {
    return true; // Allow all wallets by default
  }
});
```

### 3. Add the Provider (React/Next.js)

In your `app/layout.tsx`:

```typescript
import { AuthProvider } from 'caplib';

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <AuthProvider
          config={{
            // Required
            appName: "Your App Name",
            appDescription: "Login securely with your wallet",
            
            // Optional: Theme
            theme: {
              primary: "blue",
              secondary: "teal"
            }
          }}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Protect Your Pages

Simply wrap any page that needs authentication:

```typescript
'use client';

import { withAuth, useAuth } from 'caplib';

function ProtectedPage() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Protected Content</h1>
      
      {user?.account_type === 'entity' ? (
        <p>Welcome {user.entity_name}!</p>
      ) : (
        <p>Welcome {user.first_name} {user.last_name}!</p>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default withAuth(ProtectedPage);
```

## Vue.js Integration

For Vue.js applications, you can use the Vue wrapper:

```vue
<template>
  <div>
    <h1>Vue Authentication</h1>
    <VueCapAuth 
      :config="authConfig" 
      :onAuthenticated="handleAuth" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VueCapAuth } from 'caplib/vue';

const authConfig = {
  appName: "Vue Application",
  appDescription: "Authentication for Vue",
  theme: {
    primary: "indigo",
    secondary: "purple"
  }
};

const user = ref(null);

function handleAuth(authenticatedUser) {
  user.value = authenticatedUser;
  console.log('User authenticated:', authenticatedUser);
}
</script>
```

## Understanding the Authentication Flow

### How It Works

1. User visits a protected page
2. Auth modal automatically appears
3. User scans QR code with their wallet app
4. User approves the authentication transaction
5. Library verifies the transaction with the API
6. If new user, shows onboarding form with Human/Entity selection
7. User is authenticated and can access protected content

### The Modal UI

The authentication modal includes:
- Clean, modern design
- Smooth transitions
- QR code display
- Mobile wallet deep linking (optional)
- Loading states
- Error handling

### User Account Types

The library supports two types of accounts:
- **Human**: Individuals with first and last name
- **Entity**: Organizations with entity name (stored with last name as "ENTITY")

## Customization Options

### Styling

```typescript
<AuthProvider
  config={{
    // Theme colors
    theme: {
      primary: "indigo",    // Any Tailwind color
      secondary: "purple"   // Any Tailwind color
    },
    
    // Custom class names
    customStyles: {
      card: "backdrop-blur-xl bg-white/10",
      button: "hover:scale-105",
      input: "focus:ring-2"
    }
  }}
>
```

### Mobile Wallet Configuration

```typescript
<AuthProvider
  config={{
    enableMobileWallet: true,
    mobileWalletScheme: "zerowallet://"
  }}
>
```

### Custom Validation

```typescript
export const { GET, POST } = createAuthHandler({
  customValidation: async (walletAddress: string) => {
    // Example: Check whitelist
    const whitelist = ['0x123...'];
    return whitelist.includes(walletAddress);
  }
});
```

## API Reference

### React/Next.js Components

- `AuthProvider`: Main provider component
- `useAuth`: Hook for accessing auth context
- `withAuth`: HOC for protecting components
- `CapAuth`: Standalone auth component

### Vue Components

- `VueCapAuth`: Vue wrapper for the auth component

### Server Handlers

- `createAuthHandler`: Creates API route handlers
- `EncryptedJSONDatabase`: Database implementation

### Types

- `User`: User data model
- `CapAuthConfig`: Configuration options
- `AuthResponse`: API response type

## Security Best Practices

1. Always keep your API keys secure
2. Don't expose your DB_ENCRYPTION_KEY
3. Use custom validation for additional security
4. Implement role-based access control
5. Regularly update the library

## License

Licensed under the BSD-3-Clause License. See [LICENSE](./LICENSE) for more information.

---

<div align="center">
Built with security and simplicity in mind.

CapLib - Credentialless Authentication Protocol Library
</div>