const SHEET_ID = '1-Rvh3Ey-cto07ivmO_FDdev695EBPgUt74ZsBwiE-io';
const SHEET_NAME = 'Guest List';
const ADMIN_EMAIL = 'support@jeremydealmusic.com';
const EVENT_NAME = 'Jeremy Dean Unplugged — July 19, 2026 — Uppercuts Barber';

function doPost(e) {
  try {
    const data = parsePayload_(e);
    const sheet = getSheet_();
    const rowId = Utilities.getUuid();
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      rowId,
      data.name,
      data.email,
      data.phone,
      data.partySize,
      data.event || EVENT_NAME,
      data.paymentReference,
      'No',
      'Pending',
      data.notes,
      data.source || 'website'
    ]);

    sendNotificationEmail_({ ...data, rowId, timestamp });

    return jsonResponse_({ ok: true, rowId });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';
  const rowId = e && e.parameter ? e.parameter.rowId : '';

  if (action === 'markPaid' && rowId) {
    const updated = updateRowStatus_(rowId, {
      paid: 'Yes',
      confirmed: 'Confirmed'
    });
    return htmlResponse_(updated ? 'Marked paid successfully.' : 'Row not found.');
  }

  if (action === 'confirmParty' && rowId) {
    const updated = updateRowStatus_(rowId, {
      confirmed: 'Confirmed'
    });
    return htmlResponse_(updated ? 'Party confirmed successfully.' : 'Row not found.');
  }

  return htmlResponse_('Jeremy Dean guest list app is running.');
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing form payload.');
  }

  const payload = JSON.parse(e.postData.contents);
  const data = {
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim(),
    phone: String(payload.phone || '').trim(),
    partySize: String(payload.partySize || '').trim(),
    event: String(payload.event || '').trim(),
    paymentReference: String(payload.paymentReference || '').trim(),
    notes: String(payload.notes || '').trim(),
    source: String(payload.source || 'website').trim()
  };

  if (!data.name || !data.email || !data.partySize || !data.paymentReference) {
    throw new Error('Required fields missing.');
  }

  return data;
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp',
      'Row ID',
      'Full Name',
      'Email',
      'Phone',
      'Party Size',
      'Event',
      'Venmo Name / Payment Note',
      'Paid',
      'Confirmed',
      'Notes',
      'Source'
    ]);
  }

  return sheet;
}

function updateRowStatus_(rowId, status) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][1]) === String(rowId)) {
      if (status.paid) sheet.getRange(i + 1, 9).setValue(status.paid);
      if (status.confirmed) sheet.getRange(i + 1, 10).setValue(status.confirmed);
      return true;
    }
  }

  return false;
}

function sendNotificationEmail_(entry) {
  const webAppUrl = ScriptApp.getService().getUrl();
  const markPaidUrl = `${webAppUrl}?action=markPaid&rowId=${encodeURIComponent(entry.rowId)}`;
  const confirmPartyUrl = `${webAppUrl}?action=confirmParty&rowId=${encodeURIComponent(entry.rowId)}`;

  const subject = `Jeremy Dean paid ticket request — ${entry.name} (${entry.partySize})`;
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#14110f;">
      <h2 style="margin-bottom:8px;">New paid ticket / guest list request</h2>
      <p><strong>Name:</strong> ${escapeHtml_(entry.name)}<br />
      <strong>Email:</strong> ${escapeHtml_(entry.email)}<br />
      <strong>Phone:</strong> ${escapeHtml_(entry.phone || '—')}<br />
      <strong>Party Size:</strong> ${escapeHtml_(entry.partySize)}<br />
      <strong>Event:</strong> ${escapeHtml_(entry.event || EVENT_NAME)}<br />
      <strong>Venmo Name / Payment Note:</strong> ${escapeHtml_(entry.paymentReference)}<br />
      <strong>Notes:</strong> ${escapeHtml_(entry.notes || '—')}</p>
      <p>
        <a href="${markPaidUrl}" style="display:inline-block;padding:12px 18px;margin-right:10px;background:#e75a45;color:#fff;text-decoration:none;border-radius:999px;font-weight:bold;">Mark Paid</a>
        <a href="${confirmPartyUrl}" style="display:inline-block;padding:12px 18px;background:#b5c95d;color:#14110f;text-decoration:none;border-radius:999px;font-weight:bold;">Confirm Party</a>
      </p>
      <p style="font-size:12px;color:#6b6258;">Row ID: ${escapeHtml_(entry.rowId)}</p>
    </div>
  `;

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject,
    htmlBody
  });
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function htmlResponse_(message) {
  return HtmlService.createHtmlOutput(`
    <div style="font-family:Arial,sans-serif;padding:32px;line-height:1.6;">
      <h2>Jeremy Dean Guest List</h2>
      <p>${message}</p>
    </div>
  `);
}

function escapeHtml_(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
