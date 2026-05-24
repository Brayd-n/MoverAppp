# 🏠 MoverApp — Setup Guide

This guide walks you through getting the app live on GitHub Pages in about 15 minutes.

---

## Step 1 — Create a Firebase project

Firebase is the free backend that stores your photos and swipe decisions.

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**, give it a name (e.g. `mover-app`), and click through the setup
3. Once the project is created, click the **`</>`** (Web) icon to add a web app
4. Give it a nickname (e.g. `mover-app`) and click **"Register app"**
5. Copy the `firebaseConfig` object — you'll need these values in a moment

---

## Step 2 — Enable Firebase services

In the Firebase console sidebar:

### Authentication
1. Click **Authentication → Get started**
2. Click **Sign-in method → Email/Password → Enable → Save**
3. Click **Users → Add user**
4. Enter your admin email and a password — **write these down**, you'll use them to log into the admin panel

### Firestore (database)
1. Click **Firestore Database → Create database**
2. Choose **"Start in test mode"** (we'll tighten rules later if needed)
3. Pick any location and click **Enable**

### Storage (for photos)
1. Click **Storage → Get started**
2. Choose **"Start in test mode"** → **Next → Done**

---

## Step 3 — Set up the GitHub repo

1. Create a new GitHub repository at **https://github.com/new**
   - Name it `MoverAppp` (or whatever you want)
   - Set it to **Public** (required for free GitHub Pages)
2. Push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/MoverAppp.git
   git push -u origin main
   ```

---

## Step 4 — Add secrets to GitHub

GitHub Actions needs your Firebase keys to build the app. Keep them secret — never put them in code.

1. Go to your repo on GitHub → **Settings → Secrets and variables → Actions**
2. Click **"New repository secret"** and add each of these:

| Secret name | Value (from Firebase config) |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` value |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` value |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` value |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` value |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` value |
| `VITE_FIREBASE_APP_ID` | `appId` value |
| `VITE_BASE_URL` | `/MoverAppp/` ← your exact repo name with slashes |

---

## Step 5 — Enable GitHub Pages

1. In your repo → **Settings → Pages**
2. Under **Source**, select **"GitHub Actions"**
3. Save

---

## Step 6 — Deploy!

Push any change (or go to **Actions → Deploy to GitHub Pages → Run workflow**).

In a minute or two your app will be live at:
```
https://YOUR_USERNAME.github.io/MoverAppp/
```

---

## Step 7 — Add Firebase authorized domain

So Firebase auth works on your live URL:

1. Firebase console → **Authentication → Settings → Authorized domains**
2. Click **Add domain**
3. Enter: `YOUR_USERNAME.github.io`

---

## Using the app

| URL | What it does |
|---|---|
| `https://…/MoverAppp/` | Swipe page — share this with Mom |
| `https://…/MoverAppp/sell-list` | See all sell items + set prices |
| `https://…/MoverAppp/admin` | Admin login — upload new photos |

**Tip:** Bookmark `/admin` on your own phone. Your mom just gets the main link.

---

## Local development

```bash
# Copy the example env file
cp .env.example .env.local
# Fill in your Firebase values in .env.local

npm run dev
```
