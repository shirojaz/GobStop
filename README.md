# GobStop: Gmeet OBS Stopper
## Why
**GobStop** is a Chrome extension that scratches a very specific itch:
I use Google Meet for online classes, and I stream them through OBS to keep my own recordings. The problem? Sometimes I’d forget to stop the OBS stream after class ended, leaving hours of useless footage on YouTube.

GobStop fixes that tiny but annoying problem. It’s just a small automation that saves me from myself.  

---

## Features  
- **OBS WebSocket integration** – cleanly stops a live stream when Meet ends.  
- **Automatic Meet detection** – hooks into the Meet tab and knows when you’ve left.  
- **No false positives** – if OBS isn’t streaming, the extension stays quiet.  
- **Custom icons + clean manifest** – because if you’re gonna hack, at least make it look nice.  

---

## Installation  
1. Clone or download this repo.  
2. Open **Chrome → Extensions → Manage Extensions**.  
3. Enable **Developer mode**.  
4. Click **Load unpacked** and select this folder.  
5. Make sure OBS is running with the WebSocket plugin enabled (`localhost:4455` by default).  
6. Join a Google Meet, then leave — GobStop will stop your OBS stream automatically.  

---

## Contributing  
This is mostly a personal workflow hack, but feel free to fork and mess with it.  
Open issues or PRs if you want to add features, fix bugs, or just make it cleaner.  

---

## License  
MIT — do whatever, just don’t blame me if your stream cuts mid-meeting.  
