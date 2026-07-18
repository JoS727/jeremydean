const statusEl = document.getElementById('form-status');

if (statusEl) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('submitted') === '1') {
    statusEl.textContent = 'Guest list info submitted. Jeremy’s team got it, and the guest should receive a confirmation email.';
    statusEl.dataset.state = 'success';
  }
}
