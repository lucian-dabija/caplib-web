# CapLib | Credentialless Authentication Protocol from ZEROCAT | Powered by ZeroBrix blockchain technology

![CapLib Banner](./banner.png)

A modern, secure, and easy-to-use credentialless authentication library for web applications. Works with React, Next.js, Vue.js and other frameworks with a beautiful blockchain-based authentication flow.

## Features At a Glance

- 🎨 **Beautiful Modal UI**: Clean design with smooth animations and integrated Chakra UI
- 🔐 **Secure Authentication**: QR code-based blockchain authentication via ZeroWallet
- 🔒 **Encrypted Storage**: Built-in encrypted JSON database
- 📱 **Mobile Ready**: ZeroWallet for Android integration
- 🔄 **Simple Onboarding**: Intuitive user registration with account type selection
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

## Quick Start Guides

To use the system, follow these requirements:
1. Obtain a free API Key from ZEROCAT by writing to us at software@zerocat.art
2. Download ZeroWallet for Android or ZeroBrix Connect (.NET wallet for servers/CLI terminals) to create a wallet for your application or server
3. Use the Zerocoin (ZERO) Token ID - 2098d495-44c5-4620-ab0b-e4ee2305ba63 - as the token for your authentications
4. Run the zb_auth_onboarding.sh script to onboard your application on ZeroBrix and obtain the required smart Contract ID that will allow your application to verify authentication transactions on our blockchain

You can always contact us at software@zerocat.art for support in obtaining and setting up these details, should this guide not be enough, and we'd be more than glad to help!

### Environment Variables

Set up your environment variables in a `.env.local` file (or appropriate configuration for your framework):

```env
# Required: API Configuration
CAPLIB_API_URL=https://brix.zerocat.one/api/v2
CAPLIB_API_KEY=your_api_key

# Required: Public Variables
NEXT_PUBLIC_SERVER_WALLET_ADDRESS=your_wallet_address
NEXT_PUBLIC_TOKEN_ID=your_token_id
NEXT_PUBLIC_AUTH_CONTRACT_ID=your_contract_id

# Database Encryption (Generate with: openssl rand -hex 32)
DB_ENCRYPTION_KEY=your_random_32_byte_hex_string
```

### Next.js Implementation

1. **Create an Auth API Route**

   Create `app/api/auth/route.ts` (for App Router) or `pages/api/auth.ts` (for Pages Router):

   ```typescript
   // app/api/auth/route.ts (App Router)
   import { createAuthHandler } from 'caplib/server';

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

2. **Add the Provider to Your Layout**

   In your `app/layout.tsx` (App Router) or `pages/_app.tsx` (Pages Router):

   ```typescript
   // app/layout.tsx (App Router)
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

3. **Create a User API Route** (for storing profile information)

   Create `app/api/users/create/route.ts` (App Router) or `pages/api/users/create.ts` (Pages Router):

   ```typescript
   // app/api/users/create/route.ts (App Router)
   import { db } from 'caplib/server';
   import { NextRequest, NextResponse } from 'next/server';

   export async function POST(req: NextRequest) {
     try {
       await db.initialize();
       const userData = await req.json();
       
       const user = await db.createUser(userData);
       
       return NextResponse.json({ user });
     } catch (error) {
       console.error('Error creating user:', error);
       return NextResponse.json(
         { error: 'Failed to create user' },
         { status: 500 }
       );
     }
   }
   ```

4. **Protect Your Pages**

   ```typescript
   'use client'; // For Next.js App Router

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

### React Implementation (without Next.js)

For standard React apps, you'll need to handle API routes separately using your backend framework (Express, Koa, etc.).

1. **Set Up Your Backend**

   Create an Express route handler (for example):

   ```javascript
   // server.js
   const express = require('express');
   const { createAuthHandler, db } = require('caplib/server');
   
   const app = express();
   app.use(express.json());
   
   // Set up auth endpoints
   const { GET, POST } = createAuthHandler();
   
   app.get('/api/auth', async (req, res) => {
     const result = await GET();
     res.status(result.status).json(await result.json());
   });
   
   app.post('/api/auth', async (req, res) => {
     const result = await POST({ 
       json: () => req.body 
     });
     res.status(result.status).json(await result.json());
   });
   
   // User creation endpoint
   app.post('/api/users/create', async (req, res) => {
     try {
       await db.initialize();
       const user = await db.createUser(req.body);
       res.json({ user });
     } catch (error) {
       res.status(500).json({ error: 'Failed to create user' });
     }
   });
   
   app.listen(3000, () => {
     console.log('Server running on port 3000');
   });
   ```

2. **Add the Provider to Your React App**

   ```jsx
   // src/App.jsx
   import React from 'react';
   import { AuthProvider } from 'caplib';
   import ProtectedPage from './ProtectedPage';
   
   function App() {
     return (
       <AuthProvider
         config={{
           appName: "Your React App",
           appDescription: "Secure blockchain authentication",
           theme: {
             primary: "blue",
             secondary: "teal"
           }
         }}
       >
         <ProtectedPage />
       </AuthProvider>
     );
   }
   
   export default App;
   ```

3. **Create Protected Components**

   ```jsx
   // src/ProtectedPage.jsx
   import React from 'react';
   import { withAuth, useAuth } from 'caplib';
   
   function ProtectedPage() {
     const { user, logout } = useAuth();
     
     return (
       <div>
         <h1>Protected Content</h1>
         {user && <p>Welcome, {user.first_name}!</p>}
         <button onClick={logout}>Logout</button>
       </div>
     );
   }
   
   export default withAuth(ProtectedPage);
   ```

### Vue.js Implementation

1. **Set Up Your Backend**

   Use the same backend setup as described in the React implementation or integrate with your existing Vue backend.

2. **Install CapLib in Your Vue Project**

   ```bash
   npm install caplib
   ```

3. **Use the Vue Component**

   ```vue
   <template>
     <div>
       <h1>Vue Authentication</h1>
       
       <div v-if="user">
         <h2>Welcome, {{ user.first_name }}!</h2>
         <button @click="logout">Logout</button>
       </div>
       
       <div v-else>
         <VueCapAuth 
           :config="authConfig" 
           :onAuthenticated="handleAuth" 
         />
       </div>
     </div>
   </template>

   <script setup>
   import { ref } from 'vue';
   import { VueCapAuth } from 'caplib/vue';

   const user = ref(null);
   
   const authConfig = {
     appName: "Vue Application",
     appDescription: "Authentication for Vue",
     theme: {
       primary: "indigo",
       secondary: "purple"
     },
     enableMobileWallet: true,
     mobileWalletScheme: "zerowallet://"
   };

   function handleAuth(authenticatedUser) {
     user.value = authenticatedUser;
     console.log('User authenticated:', authenticatedUser);
   }
   
   function logout() {
     user.value = null;
     localStorage.removeItem('wallet_address');
   }
   </script>
   ```

4. **Alternative: Using the Vue Directive**

   ```vue
   <template>
     <div>
       <h1>Vue Authentication</h1>
       
       <div v-if="user">
         <h2>Welcome, {{ user.first_name }}!</h2>
         <button @click="logout">Logout</button>
       </div>
       
       <div v-else v-capauth="{ config: authConfig, onAuthenticated: handleAuth }">
         <!-- The auth component will be mounted here -->
       </div>
     </div>
   </template>

   <script setup>
   import { ref, onMounted } from 'vue';
   import { VueCapAuth } from 'caplib/vue';

   // Register the directive
   const app = createApp(App);
   app.directive('capauth', VueCapAuth.directive);
   
   // Rest of your component code as above
   </script>
   ```

## Understanding the Authentication Flow

### How It Works

1. User visits a protected page
2. Auth modal automatically appears with step indicator
3. User scans QR code with their ZeroWallet app
4. User approves the authentication transaction
5. Library verifies the transaction with the API
6. If new user, shows onboarding form with Individual/Entity selection
7. User is authenticated and can access protected content

## Customization Options

### Styling

```typescript
<AuthProvider
  config={{
    // Theme colors
    theme: {
      primary: "indigo",    // Any Chakra UI color
      secondary: "purple"   // Any Chakra UI color
    },
    // Custom styles
    customStyles: {
      container: "your-container-class",
      card: "your-card-class",
      button: "your-button-class",
      input: "your-input-class"
    }
  }}
>
```

### Mobile Wallet Configuration

```typescript
<AuthProvider
  config={{
    enableMobileWallet: true,
    mobileWalletScheme: "zerowallet://"  // Ensure this is set to ZeroWallet
  }}
>
```

### Authentication Timeouts

```typescript
<AuthProvider
  config={{
    timeouts: {
      authentication: 300000,  // 5 minutes total (ms)
      polling: 3000            // Check every 3 seconds (ms)
    }
  }}
>
```

### Redirect After Authentication

```typescript
<AuthProvider
  config={{
    redirectPath: "/dashboard",
    refreshPageOnAuth: false  // Set to true to refresh instead of redirect
  }}
>
```

## API Reference

### Core Components

- **`AuthProvider`**: Main provider component
- **`useAuth`**: Hook for accessing auth context
- **`withAuth`**: HOC for protecting components
- **`CapAuth`**: Standalone auth component

### Server Handlers

- **`createAuthHandler`**: Creates API route handlers
- **`EncryptedJSONDatabase`**: Database implementation
- **`db`**: Pre-configured database instance

### Vue Components

- **`VueCapAuth`**: Vue wrapper for the auth component

### Configuration Types

- **`CapAuthConfig`**: Main configuration options
- **`AuthHandlerConfig`**: Server handler configuration
- **`User`**: User data model
- **`NewUserData`**: New user registration data

## Security Best Practices

1. Always keep your API keys secure in environment variables
2. Generate a strong DB_ENCRYPTION_KEY using `openssl rand -hex 32`
3. Use custom validation for additional security
4. Implement role-based access control for sensitive routes
5. Regularly update the library to get security improvements

## License

Licensed under the BSD-3-Clause License. See [LICENSE](./LICENSE) for more information.

---

<div align="center">
Built with security and simplicity in mind.

CapLib - Credentialless Authentication Protocol Library
</div>