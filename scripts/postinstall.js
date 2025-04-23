const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
}

function setupDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data');
    ensureDirectoryExists(dataDir);

    const gitkeepPath = path.join(dataDir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '');
    }

    const gitignorePath = path.join(dataDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, `
# Database files
*.json
*.encrypted.json

# Keep .gitkeep
!.gitkeep
`);
    }

    // Generate encryption key if not exists
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');

    // Check if any env file exists
    if (!fs.existsSync(envLocalPath) && !fs.existsSync(envPath)) {
        const encryptionKey = generateEncryptionKey();
        const envContent = `DB_ENCRYPTION_KEY=${encryptionKey}\n`;

        try {
            fs.writeFileSync(envLocalPath, envContent);
            console.log('✅ Created .env.local with DB_ENCRYPTION_KEY');
        } catch (error) {
            console.error('⚠️ Could not create .env.local file. Please create it manually with DB_ENCRYPTION_KEY.');
        }
    }
}

function init() {
    try {
        setupDataDirectory();
        console.log('✅ CapLib: Data directory initialized');
        console.log('✅ CapLib: Authentication setup complete');
        console.log('');
        console.log('🔒 Remember to configure your environment variables:');
        console.log('- CAPLIB_API_URL: Your API endpoint');
        console.log('- CAPLIB_API_KEY: Your API key');
        console.log('- AUTH_CONTRACT_ID: Your auth contract ID');
        console.log('- NEXT_PUBLIC_SERVER_WALLET_ADDRESS: Your wallet address');
        console.log('- NEXT_PUBLIC_TOKEN_ID: Your token ID');
    } catch (error) {
        console.error('Error during post-install setup:', error);
        process.exit(1);
    }
}

init();