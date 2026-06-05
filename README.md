# MistriHub

Professional mobile-first PWA for finding and booking nearby trusted Indian workers.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Pages

- `/` Home
- `/workers` Nearby Worker Discovery
- `/book` Book Worker
- `/jobs` Job Tracking
- `/job-details` Job Details
- `/dashboard` User Dashboard
- `/worker` Worker Dashboard
- `/worker-request` Worker Review Before Accept page
- `/login` Login/Register

## Booking flow

MistriHub uses Review Before Accept:

- User submits service, problem, photo, urgency and area.
- Nearby workers get website and WhatsApp notification only.
- Worker reviews job details before choosing Accept Job, Decline Job or Need More Details.
- Phone and WhatsApp stay locked until the worker accepts.
- After accept, job status becomes Accepted, contact unlocks and tracking starts.
- SMS notification is intentionally not added yet.

## Nearby Worker Discovery

MistriHub does not use a live worker radar. Workers are shown by user area, service radius, distance, trust score, rating and completed jobs.

## Deploy

Push this folder to GitHub and deploy on Vercel. Keep the framework as Next.js and build command as `npm run build`.
