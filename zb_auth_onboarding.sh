#!/bin/bash

# ZeroBrix Onboarding Script

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to get user input
get_input() {
    prompt=$1
    read -p "${prompt}: " user_input
    echo $user_input
}

# Welcome message
print_color $GREEN "Welcome to the ZeroBrix Authentication Onboarding Script!"
print_color $YELLOW "This script will guide you through setting up transaction authentication for your website."

# Get website information
website_address=$(get_input "Enter your website's address (e.g., www.example.com)")
owner_address=$(get_input "Enter the server's wallet address")

# API endpoint
api_endpoint="https://brix.zerocat.one/api/v2"

# Create authentication contract
print_color $YELLOW "Creating authentication contract..."
response=$(curl -s -X POST "${api_endpoint}" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: zerobrix-test" \
    -d '{
    "action": "createAuthenticationContract",
    "websiteWalletAddress": "'"${owner_address}"'",
    "domainName": "'"${website_address}"'"
}')

# Extract contract ID and error message from response
contract_id=$(echo $response | jq -r '.contractId')
error_message=$(echo $response | jq -r '.error')

if [ -z "$contract_id" ] || [ "$contract_id" == "null" ]; then
    print_color $RED "Error creating authentication contract."
    print_color $RED "Error message: $error_message"
    print_color $YELLOW "Please check your input and try again."
    print_color $YELLOW "Full response: $response"
    exit 1
fi

print_color $GREEN "Authentication contract created successfully!"
print_color $YELLOW "Your contract ID is: $contract_id"

# Instructions for implementation
print_color $GREEN "\nImplementation Instructions:"
print_color $YELLOW "1. Store your contract ID securely. You'll need it for authentication requests."
print_color $YELLOW "2. To generate a nonce for authentication:"
echo "   curl -X GET \"${api_endpoint}?action=generateNonce&contractId=${contract_id}\" \\"
echo "        -H \"X-API-Key: your_api_key_here\""

print_color $YELLOW "3. Create a QR code with the following information:"
echo "   - Recipient address: ${owner_address}"
echo "   - Amount: 0.0001 ZERO (or minimum amount)"
echo "   - Transaction details: smart_contract_auth_${contract_id},nonce_\${generated_nonce}"

print_color $YELLOW "4. To verify authentication:"
echo "   curl -X POST \"${api_endpoint}\" \\"
echo "        -H \"Content-Type: application/json\" \\"
echo "        -H \"X-API-Key: your_api_key_here\" \\"
echo "        -d '{
           \"action\": \"verifyAuthentication\",
           \"contractId\": \"${contract_id}\",
           \"nonce\": \"\${used_nonce}\"
         }'"

print_color $YELLOW "5. Check the response to determine if authentication was successful."
print_color $YELLOW "   The response will include the authenticated user's wallet address if successful."

print_color $GREEN "\nRemember to replace 'your_api_key_here' with your actual ZeroBrix API key in all requests."
print_color $GREEN "For more detailed implementation guidelines, please refer to our documentation."

print_color $GREEN "\nThank you for choosing ZeroBrix for your authentication needs!"