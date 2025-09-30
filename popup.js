document.addEventListener('DOMContentLoaded', () => {
  const hostInput = document.getElementById('obsHost');
  const passInput = document.getElementById('obsPassword');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const status = document.getElementById('status');

  const DEFAULTS = { obsHost: 'ws://localhost:4455', obsPassword: 'OQiqY2mJCEFvlt3R' };

  function setStatus(msg, ok=true) {
    status.textContent = msg;
    status.style.color = ok ? 'green' : 'crimson';
  }

  // Load saved settings
  chrome.storage.sync.get(DEFAULTS, (items) => {
    hostInput.value = items.obsHost || DEFAULTS.obsHost;
    passInput.value = items.obsPassword || DEFAULTS.obsPassword;
  });

  saveBtn.addEventListener('click', () => {
    const h = hostInput.value.trim() || DEFAULTS.obsHost;
    const p = passInput.value;
    chrome.storage.sync.set({ obsHost: h, obsPassword: p }, () => {
      setStatus('Settings saved');
      setTimeout(() => setStatus(''), 1500);
    });
  });

  testBtn.addEventListener('click', () => {
    setStatus('Testing connection...');
    // send message to background to test connection
    chrome.runtime.sendMessage({ type: 'TEST_CONNECTION' }, (resp) => {
      if (!resp) {
        setStatus('No response from background', false);
        return;
      }
      if (resp.ok) {
        setStatus('Connection OK — authenticated and reachable');
      } else {
        setStatus('Connection failed: ' + (resp.error || 'unknown'), false);
      }
    });
  });
});
