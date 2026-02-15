# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the School Management System.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "School Management System")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)
5. Click "Create project"

## Step 2: Enable Authentication Methods

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Enable the following sign-in methods:

### Email/Password Authentication
- Click on "Email/Password"
- Toggle "Enable" to ON
- Click "Save"

### Google Authentication (Optional)
- Click on "Google"
- Toggle "Enable" to ON
- Select a support email
- Click "Save"

## Step 3: Register Your Web App

1. In the Firebase Console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (`</>`) to add a web app
5. Enter a nickname for your app (e.g., "School Management Web")
6. Check "Also set up Firebase Hosting" if you plan to use it (optional)
7. Click "Register app"

## Step 4: Get Your Firebase Configuration

After registering your app, you'll see your Firebase configuration. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Configure Your Local Environment

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase configuration values:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   VITE_API_BASE_URL=http://localhost:3000
   ```

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Try creating a new account with email/password
4. Try logging in with Google (if enabled)

## Security Rules (Important!)

### Authorized Domains

Make sure to add your domains to the authorized domains list:

1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your domains (e.g., `localhost`, `yourdomain.com`)

### API Key Restrictions (Production)

For production, consider restricting your API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Find your Firebase API key
4. Add application restrictions and API restrictions

## Common Issues & Solutions

### Error: "auth/configuration-not-found"
- Make sure you've enabled Email/Password authentication in Firebase Console
- Verify your Firebase configuration values are correct

### Error: "auth/invalid-api-key"
- Check that your `.env.local` file has the correct API key
- Restart your dev server after changing `.env.local`

### Error: "auth/unauthorized-domain"
- Add your domain to the authorized domains list in Firebase Console

### 400 Error on Login
- Ensure Email/Password authentication is enabled in Firebase Console
- Check that you're using a registered email/password
- Verify your Firebase configuration is correct
- Make sure the user account exists (create one first via registration)

## Environment Variables

Never commit your `.env.local` file to version control. The `.gitignore` file already includes `*.local` to prevent this.

For production deployment:
- Add environment variables to your hosting platform (Vercel, Netlify, etc.)
- Use the same variable names with `VITE_` prefix

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Error Codes](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
