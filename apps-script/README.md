# Jeremy Dean Guest List Apps Script

This is the free Google Sheets + Apps Script backend for the Jeremy Dean ticket / guest list page.

## What it does
- accepts form submissions from the website
- writes each paid guest-list entry into the Google Sheet
- emails `support@jeremydealmusic.com`
- includes **Mark Paid** and **Confirm Party** links in the email
- updates the same Google Sheet row when either link is clicked

## Google Sheet
Current sheet id:

`1-Rvh3Ey-cto07ivmO_FDdev695EBPgUt74ZsBwiE-io`

## How to deploy
1. Open the target Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Paste the contents of `guest-list-apps-script.js` into `Code.gs`.
4. Save the project.
5. Click **Deploy → New deployment**.
6. Choose **Web app**.
7. Execute as: **Me**.
8. Who has access: **Anyone**.
9. Deploy and authorize.
10. Copy the resulting Web App URL.

## Site hook-up
After deployment, replace:

`const APPS_SCRIPT_URL = '';`

inside `site.js` with the deployed Web App URL.

## Sheet columns created automatically
- Timestamp
- Row ID
- Full Name
- Email
- Phone
- Party Size
- Event
- Venmo Name / Payment Note
- Paid
- Confirmed
- Notes
- Source

## Notes
- The website will show a success or error state after submission.
- The email buttons work by calling `doGet()` with the row id.
- If the script URL changes, update `site.js` and redeploy the site.
