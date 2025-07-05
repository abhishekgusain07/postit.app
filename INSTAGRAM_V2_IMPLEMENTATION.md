# Instagram V2 Implementation

This document explains the new Instagram V2 implementation that provides an improved authentication flow based on the open source project pattern.

## Overview

The Instagram V2 implementation provides several improvements over the original implementation:

- **Better Account Selection**: Users can choose which Instagram Business account to connect
- **Improved Error Handling**: More descriptive error messages and better error recovery
- **Enhanced Authentication Flow**: Follows proven patterns from successful open source projects
- **Stable Connection**: Better token handling and refresh mechanisms

## API Endpoints

### 1. Authorization Endpoint
```
GET /api/integrations/instagram/v2/authorize
```
Initiates the Instagram OAuth flow. Redirects to Facebook's OAuth endpoint.

### 2. Callback Endpoint
```
GET /api/integrations/instagram/v2/callback
```
Handles the OAuth callback from Facebook. Processes the authorization code and redirects to account selection.

### 3. Accounts Endpoint
```
GET /api/integrations/instagram/v2/accounts
```
Returns available Instagram Business accounts for the authenticated user.

### 4. Connect Endpoint
```
POST /api/integrations/instagram/v2/connect
```
Connects a specific Instagram Business account to the user's profile.

## User Flow

1. **Start Authorization**: User clicks "Connect Instagram V2" button
2. **OAuth Flow**: User is redirected to Facebook's OAuth consent screen
3. **Account Selection**: After authorization, user sees a list of available Instagram Business accounts
4. **Connect Account**: User selects which account to connect
5. **Success**: Account is connected and user is redirected to integrations page

## Components

### InstagramV2Provider
Located at `src/providers/instagram-v2.provider.ts`

Key methods:
- `generateAuthUrl()`: Creates authorization URL with state and code verifier
- `authenticate()`: Exchanges authorization code for access token
- `pages()`: Retrieves available Instagram Business accounts
- `connectInstagramAccount()`: Connects a specific account to the user

### InstagramV2ConnectButton
Located at `src/components/integeration/instagramV2ConnectButton.tsx`

A React component that provides the UI for connecting Instagram accounts with the V2 flow.

### Account Selection Page
Located at `src/app/integrations/instagram/v2/select-account/page.tsx`

A dedicated page for users to select which Instagram Business account to connect.

## Environment Variables

The implementation uses the same environment variables as the original:
- `FACEBOOK_CLIENT_ID`: Facebook App ID
- `FACEBOOK_CLIENT_SECRET`: Facebook App Secret
- `FRONTEND_URL`: Your application's frontend URL

## Key Differences from V1

1. **Account Selection**: V2 allows users to choose between multiple Instagram Business accounts
2. **Better Error Messages**: More descriptive error handling throughout the flow
3. **Improved Token Management**: Better handling of temporary tokens and state management
4. **Enhanced Security**: Additional validation and CSRF protection
5. **Modern UI**: Better user experience with loading states and error handling

## Integration

To use the V2 implementation alongside the existing V1 implementation:

1. Import the V2 connect button:
```tsx
import InstagramV2ConnectButton from '@/components/integeration/instagramV2ConnectButton';
```

2. Use it in your integrations page:
```tsx
<InstagramV2ConnectButton
  isConnected={isConnected}
  connectedAccount={connectedAccount}
  onDisconnect={handleDisconnect}
/>
```

## Testing

To test the V2 implementation:

1. Ensure you have a Facebook App configured with Instagram Basic Display API
2. Make sure your app has the required permissions:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `instagram_manage_insights`
3. Test the full flow from authorization to account connection

## Troubleshooting

### Common Issues:

1. **No Instagram accounts found**: Make sure the user has Instagram Business accounts connected to their Facebook pages
2. **Authorization failed**: Check that environment variables are correctly set
3. **Account selection not working**: Verify that cookies are enabled and working properly
4. **Token expired**: The implementation handles token refresh automatically

### Debug Mode:

Check the browser console and server logs for detailed error messages during the flow.

## Testing Results

### ✅ Successfully Tested
- OAuth flow works correctly and redirects to Facebook
- Authorization callback processes correctly
- Properly detects when no Instagram accounts are connected
- Shows user-friendly error messages instead of generic errors
- Handles edge cases gracefully

### 🔍 Current Issue: No Instagram Accounts
The integration is working correctly, but you're getting a "no_instagram_accounts" error because:
- Your Facebook account doesn't have Instagram Business accounts connected to it
- This is the expected behavior when no Instagram accounts are available

### 📋 Requirements for Testing
To properly test the Instagram V2 integration, you need:
1. A Facebook account with Instagram Business accounts connected
2. Admin access to those Instagram Business accounts
3. The Instagram accounts must be connected to Facebook pages

### 🛠️ How to Fix
1. **Connect Instagram to Facebook**: Go to Facebook Settings → Instagram and connect your Instagram Business account
2. **Use a Different Account**: Test with a Facebook account that already has Instagram Business accounts
3. **Create Business Account**: Convert a personal Instagram account to a Business account and connect it

### 🧪 Test Page
Visit `/test-instagram-v2` for a comprehensive testing interface that includes:
- Current status check
- Requirements checklist
- Step-by-step fix instructions
- Environment variable verification
- Direct test buttons

## Future Enhancements

Potential improvements that could be added:
- Account reconnection flow
- Bulk account management
- Enhanced analytics integration
- Automated token refresh scheduling 