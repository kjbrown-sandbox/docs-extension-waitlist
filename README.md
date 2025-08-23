Docs Extension — Waitlist landing page

This repository contains a small static landing page + a Netlify serverless function that proxies waitlist signups into a Google Sheet via a Google Apps Script Web App. It's built for a low-cost, fast fake-door test for a Chrome extension.

How it works

-  The front-end at `index.html` collects email and captures UTM and referrer.
-  On submit it POSTs to the Netlify function which forwards the payload (and a token if configured) to your Apps Script web app.
-  The Apps Script appends the signup as a new row in your Google Sheet.

Notes & next steps

-  Apps Script and Google Sheets have quotas — for a small waitlist this is free and safe. If you expect high volume (many thousands/day) consider moving to a database later.
-  Consider adding server-side dedupe or checks in Apps Script to avoid duplicate emails.
-  Add reCAPTCHA or rate-limiting in the Netlify function if you observe bot traffic.
