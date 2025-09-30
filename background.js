const OBS_PASSWORD = "";
const OBS_WS_URL = "ws://localhost:4455";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "MEETING_ENDED") {
    stopObsStream();
  }
});

async function stopObsStream() {
  try {
    const ws = new WebSocket(OBS_WS_URL);

    ws.onopen = () => {
      console.log("[Meet OBS] WebSocket opened to OBS");
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Step 1: OBS "Hello" -> contains authentication challenge if password set
        if (msg.op === 0 && msg.d && msg.d.authentication) {
          const { challenge, salt } = msg.d.authentication;
          const secret = await sha256Base64(OBS_PASSWORD + salt);
          const auth = await sha256Base64(secret + challenge);

          const identify = {
            op: 1,
            d: {
              rpcVersion: 1,
              authentication: auth
            }
          };
          ws.send(JSON.stringify(identify));
          console.log("[Meet OBS] Sent Identify (with hashed auth)");
          return;
        }

        // Authenticated (Op 2) or no auth required
        if (msg.op === 2) {
          console.log("[Meet OBS] Authenticated with OBS (or no auth required)");

          // Send StopStream request
          const request = {
            op: 6,
            d: {
              requestType: "StopStream",
              requestId: "stop-stream-1"
            }
          };
          ws.send(JSON.stringify(request));
          return;
        }

        // Response for StopStream (op 7)
        if (msg.op === 7 && msg.d && msg.d.requestId === "stop-stream-1") {
          const ok = msg.d.requestStatus && msg.d.requestStatus.result;
          if (ok) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon128.png",
              title: "GobStop",
              message: "OBS stream stopped successfully ✅"
            });
            console.log("[Meet OBS] Stream stopped successfully");
          } else {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon128.png",
              title: "Shirojaz Meet OBS Stopper",
              message: "Failed to stop OBS stream ⚠️"
            });
            console.error("[Meet OBS] Failed to stop stream:", msg.d);
          }
          try { ws.close(); } catch(e) {}
          return;
        }
      } catch (e) {
        console.error("[Meet OBS] Error parsing message:", e, event.data);
      }
    };

    ws.onerror = (err) => {
      console.error("[Meet OBS] WebSocket error (is OBS running?):", err);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: "GobStop",
        message: "Could not connect to OBS WebSocket ❌"
      });
    };

    // Safety: if websocket doesn't respond within X seconds, close it
    setTimeout(() => {
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        try { ws.close(); } catch(e) {}
      }
    }, 8000);

  } catch (err) {
    console.error("[Meet OBS] Unexpected error:", err);
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon128.png",
      title: "Shirojaz Meet OBS Stopper",
      message: "Unexpected error: " + (err && err.message ? err.message : err)
    });
  }
}

// Helper: SHA256 -> Base64
async function sha256Base64(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  let str = '';
  const arr = new Uint8Array(hash);
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return btoa(str);
}
