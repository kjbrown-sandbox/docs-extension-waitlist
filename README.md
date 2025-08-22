Docs Extension — Waitlist landing page

This repository contains a small static landing page + a Netlify serverless function that proxies waitlist signups into a Google Sheet via a Google Apps Script Web App. It's built for a low-cost, fast fake-door test for a Chrome extension.

Quick setup (Google Sheets + Apps Script)

1. Create a Google Sheet and name a sheet/tab `waitlist`.
   -  Recommended header row: `created_at,email,utm_source,utm_medium,utm_campaign,referrer,client_info`
2. In Google Drive create New → More → Google Apps Script and paste the Apps Script code shown below. Replace `<YOUR_SHEET_ID>` with your Sheet ID (from the sheet URL).

Apps Script (paste into the editor)

```javascript
function doPost(e) {
   try {
      var SECRET = PropertiesService.getScriptProperties().getProperty("WAITLIST_TOKEN") || "";
      var req = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;
      if (!req)
         return ContentService.createTextOutput(
            JSON.stringify({ error: "No payload" })
         ).setMimeType(ContentService.MimeType.JSON);

      var token = req.token || "";
      if (SECRET && token !== SECRET) {
         return ContentService.createTextOutput(
            JSON.stringify({ error: "Unauthorized" })
         ).setMimeType(ContentService.MimeType.JSON);
      }

      var email = (req.email || "").toString().trim().toLowerCase();
      if (!email || !email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
         return ContentService.createTextOutput(
            JSON.stringify({ error: "Invalid email" })
         ).setMimeType(ContentService.MimeType.JSON);
      }

      var ss = SpreadsheetApp.openById("<YOUR_SHEET_ID>");
      var sheet = ss.getSheetByName("waitlist") || ss.insertSheet("waitlist");
      if (sheet.getLastRow() === 0) {
         sheet.appendRow([
            "created_at",
            "email",
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "referrer",
            "client_info",
         ]);
      }

      var row = [
         new Date().toISOString(),
         email,
         req.utm_source || "",
         req.utm_medium || "",
         req.utm_campaign || "",
         req.referrer || "",
         req.client_info || "",
      ];
      sheet.appendRow(row);

      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
         ContentService.MimeType.JSON
      );
   } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(
         ContentService.MimeType.JSON
      );
   }
}
```

3. (Optional but recommended) Set a script property `WAITLIST_TOKEN` to a secret string in Project Settings and deploy with that token required.
4. Deploy → New deployment → Select type "Web app". Set "Execute as" to your account and "Who has access" to "Anyone" (for easiest client calls). Copy the deployed web app URL.

5. In your Netlify site settings, set these environment variables:

   -  `APPS_SCRIPT_URL` = the Apps Script web app URL (from step 4)
   -  `APPS_SCRIPT_TOKEN` = the same secret you set as `WAITLIST_TOKEN` (optional; recommended)

6. Replace the GA measurement id in `index.html` (G-XXXXXXX) with your GA4 ID.

7. Deploy to Netlify (connect the repo or drag the folder onto Netlify). The client posts to `/.netlify/functions/subscribe`, which proxies to Apps Script and stores rows in your Google Sheet.

How it works

-  The front-end at `index.html` collects email and captures UTM and referrer.
-  On submit it POSTs to the Netlify function which forwards the payload (and a token if configured) to your Apps Script web app.
-  The Apps Script appends the signup as a new row in your Google Sheet.

Notes & next steps

-  To track conversions in GA4, configure a conversion on the `signup` event or create an event from the Netlify success response.
-  Apps Script and Google Sheets have quotas — for a small waitlist this is free and safe. If you expect high volume (many thousands/day) consider moving to a database later.
-  Consider adding server-side dedupe or checks in Apps Script to avoid duplicate emails.
-  Add reCAPTCHA or rate-limiting in the Netlify function if you observe bot traffic.
