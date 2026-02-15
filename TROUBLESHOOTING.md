# Troubleshooting Guide

## Current Error Analysis

### Error 1: `auth/invalid-credential`

**What it means:**
- You're trying to login with an account that doesn't exist in Firebase
- Or the password is wrong

**How to fix:**
1. ✅ **First, create an account** by going to the registration page
2. ✅ Then try logging in with those credentials

**Don't have an account?**
- Go to `/register` page
- Fill in the registration form
- Submit to create your account
- Then return to login

### Error 2: 500 Error from `/organizations` endpoint

**What it means:**
- This error happens AFTER successful login
- The backend server is having issues

**Common causes:**
1. Backend server is not running
2. Database connection issue
3. User doesn't have an organization assigned yet

**How to fix:**
1. Make sure your backend server is running on `http://localhost:3000`
2. Check backend server logs for errors
3. This might be expected for new users who haven't been assigned to an organization yet

---

## Complete Authentication Flow

Here's the **CORRECT ORDER** to test authentication:

### 1. Enable Firebase Email/Password Auth

Go to [Firebase Console](https://console.firebase.google.com/):
1. Select project: `rootx-school-ms-firebase`
2. Click "Authentication" → "Sign-in method"
3. Enable "Email/Password"
4. Save

### 2. Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 3. Register a New Account

Go to: `http://localhost:5173/register`

Fill in:
- Name: Test User
- Email: test@example.com
- Password: Test123456
- Confirm Password: Test123456

Click "Sign Up"

### 4. Login with Your New Account

Go to: `http://localhost:5173/login`

Enter:
- Email: test@example.com
- Password: Test123456

Click "Sign In"

---

## Visual Indicators

In development mode, you'll now see:

### ✅ Green Badge (Bottom Right)
```
Firebase Connected
Project: rootx-school-ms-firebase
```
This means Firebase is properly configured.

### ❌ Red Badge (Bottom Right)
```
Firebase Configuration Error
Missing environment variables: ...
```
This means your `.env.local` file isn't loaded properly.

**Fix:**
1. Make sure `.env.local` exists
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

---

## Testing Utilities

Open browser console (F12) and run these commands:

### Check Firebase Configuration
```javascript
window.firebaseTest.testConfig()
```

Expected output: All ✅ (green checkmarks)

### Test Registration
```javascript
await window.firebaseTest.testRegister('test@example.com', 'Test123456')
```

Expected output: `✅ Registration successful!`

### Test Login
```javascript
await window.firebaseTest.testLogin('test@example.com', 'Test123456')
```

Expected output: `✅ Login successful!`

---

## Common Errors & Solutions

### "auth/operation-not-allowed"

**Cause:** Email/Password auth not enabled in Firebase Console

**Fix:**
1. Go to Firebase Console
2. Authentication → Sign-in method
3. Enable Email/Password
4. Save

### "auth/email-already-in-use"

**Cause:** This email is already registered

**Fix:**
1. Use login instead of registration
2. OR use a different email
3. OR delete the user from Firebase Console

### "auth/weak-password"

**Cause:** Password is too short (less than 6 characters)

**Fix:** Use a password with at least 6 characters

### Environment variables not loading

**Symptoms:**
- Red badge showing missing variables
- `testConfig()` shows ❌

**Fix:**
1. Verify `.env.local` exists in project root
2. Check file has correct variable names (with `VITE_` prefix)
3. Restart dev server completely
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Backend API errors (500, 404, etc.)

**Cause:** Backend server issues

**Fix:**
1. Make sure backend server is running
2. Check backend server logs
3. Verify `VITE_API_BASE_URL` in `.env.local` points to correct backend
4. For new users without organizations, the `/organizations` error is expected

---

## Verify User in Firebase Console

To see if registration worked:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Authentication"
4. Click "Users" tab
5. You should see your registered users here

---

## Still Having Issues?

### Check Browser Console

1. Open Developer Tools (F12)
2. Go to "Console" tab
3. Look for red error messages
4. Share the full error stack trace

### Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Try to login
4. Look for failed requests (red text)
5. Click on failed request to see details

### Check Backend Logs

If the backend server is running, check its console output for error messages.

---

## Expected Flow After Successful Login

1. ✅ Login successful
2. 🔄 App fetches user data from MongoDB
3. 🔄 App tries to fetch organization data
   - If user has organization → Success, go to dashboard
   - If user has NO organization → Redirect to "waiting-for-organization" page
4. 🏠 User sees appropriate page based on their status

---

## Quick Checklist

Before asking for help, verify:

- [ ] `.env.local` file exists and has all Firebase variables
- [ ] Dev server has been restarted after creating `.env.local`
- [ ] Email/Password authentication is enabled in Firebase Console
- [ ] You've REGISTERED first before trying to login
- [ ] Browser cache is cleared (Ctrl+Shift+R)
- [ ] Backend server is running (if testing full flow)
- [ ] You can see the green "Firebase Connected" badge

---

## Production Deployment

When deploying to production:

1. Set all `VITE_*` environment variables in your hosting platform
2. Do NOT commit `.env.local` to Git
3. Verify authorized domains in Firebase Console
4. Test authentication in production environment
