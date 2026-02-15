# Quick Start Guide - Firebase Authentication

## Understanding the Error

The error `auth/invalid-credential` means:
- ❌ You're trying to login with an account that doesn't exist in Firebase yet
- ❌ The email or password is incorrect

**Solution:** You need to **REGISTER FIRST**, then login!

## Step-by-Step Guide

### Step 1: Enable Email/Password Authentication in Firebase

**THIS IS CRITICAL!** Without this, registration won't work.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on your project: `rootx-school-ms-firebase`
3. Click "Authentication" in the left sidebar
4. Click "Get started" (if you see it)
5. Click on the "Sign-in method" tab
6. Find "Email/Password" in the list
7. Click on it
8. Toggle the "Enable" switch to ON
9. Click "Save"

✅ You should see "Enabled" next to Email/Password now.

### Step 2: Restart Your Dev Server

```bash
# Press Ctrl+C to stop the server
# Then restart it
npm run dev
```

### Step 3: Test Firebase Configuration

Open your browser console (F12) and run:

```javascript
window.firebaseTest.testConfig()
```

You should see all green checkmarks (✅). If you see red X's (❌), your environment variables aren't loaded.

### Step 4: Register a New Account

**Option A: Using the UI**

1. Go to `http://localhost:5173/register` (or whatever your dev server URL is)
2. Fill in the registration form:
   - Name: Your Name
   - Email: test@example.com (or any email)
   - Password: Test123456 (at least 6 characters)
   - Confirm Password: Test123456
3. Click "Sign Up"
4. If successful, you'll be redirected

**Option B: Using the Browser Console (for testing)**

Open the browser console (F12) and run:

```javascript
await window.firebaseTest.testRegister('test@example.com', 'Test123456')
```

If you see ✅ messages, registration worked!

### Step 5: Login with Your Account

**Option A: Using the UI**

1. Go to `http://localhost:5173/login`
2. Enter the same credentials you just registered:
   - Email: test@example.com
   - Password: Test123456
3. Click "Sign In"

**Option B: Using the Browser Console**

```javascript
await window.firebaseTest.testLogin('test@example.com', 'Test123456')
```

## Common Issues & Solutions

### Issue 1: "auth/operation-not-allowed"

**Cause:** Email/Password authentication is not enabled in Firebase Console

**Solution:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Email/Password authentication
3. Save and try again

### Issue 2: "auth/invalid-credential" or "auth/user-not-found"

**Cause:** You're trying to login with an account that doesn't exist

**Solution:**
1. First register the account using the registration page
2. Then try logging in

### Issue 3: Environment variables not loading

**Symptoms:** `window.firebaseTest.testConfig()` shows ❌

**Solution:**
1. Make sure `.env.local` file exists in your project root
2. Restart your dev server completely
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 4: "auth/email-already-in-use"

**Cause:** The email is already registered

**Solution:**
1. Either login with that email instead
2. Or use a different email for registration
3. Or delete the user from Firebase Console and register again

## Testing Flow

Here's the complete testing flow:

```javascript
// 1. Test configuration
window.firebaseTest.testConfig()

// 2. Register a new user
await window.firebaseTest.testRegister('test@example.com', 'Test123456')

// 3. Login with that user
await window.firebaseTest.testLogin('test@example.com', 'Test123456')
```

## Firebase Console - User Management

To see your registered users:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Authentication"
4. Click "Users" tab
5. You should see all registered users here

You can also manually delete users from this page if needed.

## Next Steps

Once authentication is working:

1. Test the complete registration → login flow in the UI
2. Test Google Sign-In (if enabled)
3. Test logout functionality
4. Test the dashboard access after login

## Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Check the Firebase Console to see if users are being created
3. Verify Email/Password authentication is enabled
4. Make sure you're registering BEFORE trying to login
5. Check that your `.env.local` file has all the correct values

## Security Note

⚠️ **NEVER** commit `.env.local` to Git. It's already in `.gitignore`.

For production deployment, set these environment variables in your hosting platform (Vercel, Netlify, etc.).
