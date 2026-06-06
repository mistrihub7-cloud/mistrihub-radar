# MistriHub Web Push / FCM Setup

FCM code is already wired in the app. Add these values in Vercel Environment Variables and in local `.env.local` when testing locally.

## Firebase public web config

Create a Firebase project, add a Web App, then copy the web config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

`NEXT_PUBLIC_FIREBASE_VAPID_KEY` is from Firebase Console:
Project settings -> Cloud Messaging -> Web Push certificates.

## Firebase Admin server config

Create a service account key in Firebase Console:
Project settings -> Service accounts -> Generate new private key.

Add these in Vercel:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

For `FIREBASE_PRIVATE_KEY`, paste the full private key and keep newlines as `\n` if Vercel stores it in one line.

## Supabase server key

The push API needs to read tokens server-side:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

Keep this secret. Do not add it to GitHub.

## Supabase SQL

Run the latest `supabase-booking-policies.sql` in Supabase SQL Editor. It creates the `push_tokens` table and required policies.

## How it works

1. Worker/User clicks Allow Job Alerts.
2. Browser creates FCM token.
3. Token is saved in `push_tokens`.
4. Booking request sends push to matching service workers.
5. Job status updates send push to the user or assigned worker.
