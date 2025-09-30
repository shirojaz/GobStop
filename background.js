// background service worker
// Uses stored config (chrome.storage.sync) for OBS host/password
// Implements TEST_CONNECTION and handles MEETING_ENDED to stop streams
const DEFAULTS = { obsHost: 'ws://localhost:4455', obsPassword: '' };
const STOP_REQUEST_ID = 'stop-stream-1';

// Utility: fetch config from storage (returns Promise)
function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULTS, (items) => {
      resolve({ host: items.obsHost || DEFAULTS.obsHost, password: items.obsPassword || DEFAULTS.obsPassword });
    });
  });
}

// Message handler
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === 'TEST_CONNECTION') {
    (async () => {
      const cfg = await getConfig();
      const res = await testObsConnection(cfg.host, cfg.password);
      sendResponse(res);
    })();
    return true; // keep channel open for async response
  }
  if (msg.type === 'MEETING_ENDED') {
    (async () => {
      const cfg = await getConfig();
      stopObsStream(cfg.host, cfg.password);
    })();
  }
});

// Test connection: return { ok: bool, error: string? }
function testObsConnection(host, password) {
  return new Promise((resolve) => {
    let ws;
    try {
      ws = new WebSocket(host);
    } catch (e) {
      resolve({ ok: false, error: 'Invalid host or WebSocket not permitted' });
      return;
    }
    let handled = false;

    const tidy = (ok, error) => {
      if (handled) return;
      handled = true;
      try { ws.close(); } catch(e){}
      resolve({ ok, error });
    };

    ws.onopen = () => {
      // wait for Hello to arrive (server sends Hello). Do nothing here.
    };

    ws.onmessage = async (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        // If server sends authentication in Hello
        if (msg.op === 0 && msg.d && msg.d.authentication) {
          const { challenge, salt } = msg.d.authentication;
          const secret = await sha256Base64(password + salt);
          const auth = await sha256Base64(secret + challenge);
          const identify = { op: 1, d: { rpcVersion: 1, authentication: auth } };
          ws.send(JSON.stringify(identify));
          return;
        }
        // Auth success
        if (msg.op === 2) {
          tidy(true);
          return;
        }
        // If server doesn't require auth and sends something else, still consider success
        if (!msg.d || !msg.d.authentication) {
          tidy(true);
          return;
        }
      } catch (e) {
        tidy(false, 'Parse error: ' + (e && e.message));
      }
    };

    ws.onerror = (err) => {
      tidy(false, 'WebSocket error');
    };

    // Safety timeout
    setTimeout(() => tidy(false, 'Timeout waiting for response'), 5000);
  });
}

// Stop stream (fire and forget)
async function stopObsStream(host, password) {
  try {
    const ws = new WebSocket(host);
    ws.onopen = () => {
      console.log('[Meet OBS] WS opened to', host);
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.op === 0 && msg.d && msg.d.authentication) {
          const { challenge, salt } = msg.d.authentication;
          const secret = await sha256Base64(password + salt);
          const auth = await sha256Base64(secret + challenge);
          const identify = { op: 1, d: { rpcVersion: 1, authentication: auth } };
          ws.send(JSON.stringify(identify));
          return;
        }

        if (msg.op === 2) {
          // authenticated or no auth required
          const request = { op: 6, d: { requestType: 'StopStream', requestId: STOP_REQUEST_ID } };
          ws.send(JSON.stringify(request));
          return;
        }

        if (msg.op === 7 && msg.d && msg.d.requestId === STOP_REQUEST_ID) {
          const ok = msg.d.requestStatus && msg.d.requestStatus.result;
          if (ok) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icon128.png',
              title: 'GobStop: GMeet OBS Stopper',
              message: 'OBS stream stopped successfully ✅'
            });
            console.log('[Meet OBS] Stream stopped successfully');
          } else {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icon128.png',
              title: 'GobStop: GMeet OBS Stopper',
              message: 'Failed to stop OBS stream ⚠️'
            });
            console.error('[Meet OBS] Failed to stop stream:', msg.d);
          }
          try { ws.close(); } catch(e){}
          return;
        }
      } catch (e) {
        console.error('[Meet OBS] Error parsing message', e);
      }
    };

    ws.onerror = (err) => {
      console.error('[Meet OBS] WebSocket error (is OBS running?):', err);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'GobStop: GMeet OBS Stopper',
        message: 'Could not connect to OBS WebSocket ❌'
      });
    };

    // safety close
    setTimeout(() => {
      try { ws.close(); } catch(e){}
    }, 8000);

  } catch (err) {
    console.error('[Meet OBS] Unexpected error:', err);
  }
}

// helper: sha256 -> base64
async function sha256Base64(input) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  let s = '';
  const arr = new Uint8Array(hash);
  for (let i=0;i<arr.length;i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}
