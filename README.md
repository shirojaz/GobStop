# GobStop: Gmeet-OBS-Stopper

A Chrome extension that automatically stops your OBS stream when your Google Meet call ends.  
Built for clean integration with [OBS WebSocket v5+](https://github.com/obsproject/obs-websocket).

---

## Features
- Detects when you leave or end a Google Meet.
- Sends a `StopStream` command to OBS via WebSocket.
- Handles password-protected OBS WebSocket servers.
- Shows Chrome notifications for success, errors, or connection issues.
- Prevents duplicate triggers (only runs once per leave).

---

## Requirements
- **OBS Studio** with [obs-websocket](https://github.com/obsproject/obs-websocket) enabled.  
  - Default: `ws://localhost:4455`  
  - Make sure to set the password in `background.js` (currently hardcoded).
- **Google Chrome** (tested on latest stable).

---

## Installation
1. Clone or download this repo.
2. In Chrome, go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder.
5. You should now see *Shirojaz Meet OBS Stopper* in your extensions bar.

---

## Usage
- Join a Google Meet as usual.
- When the meeting ends (or you leave), OBS will automatically stop streaming.
- Notifications will pop up for success/failure if Chrome notifications are enabled.

---

## Configuration
- To change the OBS WebSocket server or password, edit `background.js`:
  ```js
  const OBS_HOST = "ws://localhost:4455";
  const OBS_PASSWORD = "";
