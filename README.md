# GobStop: Gmeet-OBS-Stopper

Stops your OBS livestream automatically when a Google Meet ends.  
Now with a popup to configure OBS connection settings and test them directly.

---

## Features
- Detects when you leave or get auto-booted from a Google Meet.
- Sends a `StopStream` request to OBS via WebSocket.
- **Popup configuration**:
  - Set custom OBS WebSocket host (default: `ws://localhost:4455`)
  - Set OBS password (if enabled in OBS)
  - Save settings to Chrome Sync (works across devices)
- **Test Connection** button to quickly check if OBS is reachable and auth works.
- Notifications for success/failure when attempting to stop a stream.

---

## Installation
1. Download and unzip this repo (or clone it).
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in top right).
4. Click **Load unpacked** and select the project folder.
5. The extension will appear in your toolbar.

---

## Usage
1. Click the extension icon in Chrome.
2. Enter your OBS WebSocket host + password, then click **Save**.
3. (Optional) Use **Test Connection** to verify OBS is reachable.
4. Join a Google Meet. When the meeting ends, OBS stream will automatically stop.
5. You’ll get a Chrome notification when the stop request succeeds or fails.

---

## Roadmap
Planned improvements:
- **Auto-start OBS stream** when a Meet begins.
- **Logging panel** in the extension popup for recent events.
- **Optional toggle** to enable/disable auto-stop without uninstalling.

---

## Requirements
- OBS Studio with **obs-websocket** plugin (v5 or newer).
- OBS WebSocket must be enabled and accessible at the configured host/port.
- Chrome-based browser (tested on latest Chrome).

---

## Version History
- **v2.0**  
  - Added popup UI for OBS host/password configuration.  
  - Added **Test Connection** button.  
  - Credentials stored via `chrome.storage.sync`.  
  - Background script updated to use stored config.  
- **v1.0**  
  - Initial release.  
  - Hardcoded OBS host/password.  
  - Stopped stream on Meet leave only.

---

## License
MIT License
