# Firebase OAuth Setup Guide

## Overview
This guide explains how to enable Google and GitHub authentication in your Firebase project.

## Error You're Seeing
```
Firebase: Error (auth/configuration-not-found)
```

This error means that OAuth providers (Google, GitHub) are not enabled in your Firebase Console.

## Solution: Enable OAuth Providers in Firebase

### 1. Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **boiler-plate-f1938**

### 2. Enable Google Sign-In

1. In the left sidebar, click **Authentication**
2. Click on the **Sign-in method** tab
3. Find **Google** in the list of providers
4. Click on **Google**
5. Toggle the **Enable** switch to ON
6. Enter your **Project support email** (your email address)
7. Click **Save**

**Screenshot Location:**
```
Firebase Console → Authentication → Sign-in method → Google → Enable
```

### 3. Enable GitHub Sign-In (Optional)

#### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: `Your SaaS Boilerplate`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://boiler-plate-f1938.firebaseapp.com/__/auth/handler`
     *(Replace with your Firebase Auth Domain from Console)*
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy the **Client Secret**

#### Step 2: Configure in Firebase

1. In Firebase Console, go to **Authentication → Sign-in method**
2. Find **GitHub** in the list
3. Click on **GitHub**
4. Toggle the **Enable** switch to ON
5. Paste your GitHub **Client ID**
6. Paste your GitHub **Client Secret**
7. Copy the **Authorization callback URL** displayed
8. Click **Save**

#### Step 3: Update GitHub OAuth App (if needed)

1. Go back to your GitHub OAuth app settings
2. Verify the **Authorization callback URL** matches the one from Firebase
3. Save if you made any changes

### 4. Verify Configuration

After enabling the providers:

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Go to your app: `http://localhost:3000`

3. Click on "Sign in with Google" or "Sign in with GitHub"

4. You should now see the OAuth popup instead of an error

## Current Firebase Project Details

Your `.env.local` file has:
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID="boiler-plate-f1938"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="boiler-plate-f1938.firebaseapp.com"
```

**Direct Link to Your Firebase Authentication:**
```
https://console.firebase.google.com/project/boiler-plate-f1938/authentication/providers
```

## Authorization Callback URLs

When setting up OAuth providers, use these callback URLs:

**Firebase:**
```
https://boiler-plate-f1938.firebaseapp.com/__/auth/handler
```

**For localhost testing (if needed):**
```
http://localhost:3000
```

## Testing OAuth Flow

After enabling providers:

1. **Test Google Sign-In:**
   - Click "Sign in with Google" button
   - Select your Google account
   - Authorize the app
   - You should be redirected to `/dashboard`

2. **Test GitHub Sign-In:**
   - Click "Sign in with GitHub" button
   - Authorize the GitHub app
   - You should be redirected to `/dashboard`

## Common Issues

### Issue: "popup-closed-by-user"
- **Cause**: User closed the OAuth popup before completing sign-in
- **Solution**: This is normal user behavior, no action needed

### Issue: "auth/unauthorized-domain"
- **Cause**: Your domain is not in Firebase's authorized domains list
- **Solution**: 
  1. Go to Firebase Console → Authentication → Settings
  2. Add `localhost` and your production domain to **Authorized domains**

### Issue: OAuth popup is blocked
- **Cause**: Browser popup blocker
- **Solution**: Allow popups for your app or use redirect-based OAuth instead

## Production Setup

Before deploying to production:

1. **Add production domain to Firebase:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your production domain (e.g., `yoursaas.com`)

2. **Update GitHub OAuth App:**
   - Add production callback URL
   - Update Homepage URL to your production URL

3. **Update environment variables:**
   ```env
   NEXT_PUBLIC_APP_URL=https://yoursaas.com
   ```

## Additional Security

### Recommended Settings

1. **Email Enumeration Protection:**
   - Firebase Console → Authentication → Settings
   - Enable "Email enumeration protection"

2. **Email Link Sign-In (Optional):**
   - Enable for passwordless authentication
   - Configure email templates

3. **OAuth Scopes:**
   - Google: `email`, `profile` (default)
   - GitHub: `read:user`, `user:email`

## Troubleshooting

If you still see errors after enabling providers:

1. **Clear browser cache and cookies**
2. **Restart dev server:**
   ```bash
   npm run dev:kill
   npm run dev
   ```
3. **Check browser console** for detailed error messages
4. **Verify Firebase config** in `.env.local` matches Firebase Console

## Next Steps

After enabling OAuth:

1. ✅ Test sign-in flow
2. ✅ Verify user data syncs to your database
3. ✅ Test sign-out functionality
4. ✅ Configure user profile completion flow
5. ✅ Set up email verification (if needed)

## Support

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)

---

**Last Updated**: February 7, 2026  
**Firebase Project**: boiler-plate-f1938
