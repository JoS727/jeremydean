const APPS_SCRIPT_URL = '';

const form = document.getElementById('guest-list-form');
const statusEl = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!APPS_SCRIPT_URL) {
      setStatus('The free Google Sheet guest-list backend is prepared but still needs the Apps Script web app URL pasted into site.js before submissions can go live.', 'warning');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      partySize: formData.get('party_size'),
      event: formData.get('event'),
      paymentReference: formData.get('payment_reference'),
      notes: formData.get('notes'),
      source: 'jeremydeanmusic.com'
    };

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      setStatus('Submitting your paid guest-list entry...', 'info');

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Submission failed.');
      }

      form.reset();
      const eventField = form.querySelector('input[name="event"]');
      if (eventField) {
        eventField.value = 'Jeremy Dean Unplugged — July 19, 2026 — Uppercuts Barber';
      }
      setStatus('You’re on the list. Payment details and guest info were sent to Jeremy’s team.', 'success');
    } catch (error) {
      setStatus(error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit paid ticket / guest list request';
    }
  });
}

function setStatus(message, type) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.state = type;
}
