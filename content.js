let alreadyStopped = false;

function checkMeetingState() {
  const bodyText = document.body.innerText || "";

  // Case 1: Meeting ended
  if (!alreadyStopped && bodyText.includes("You left the meeting")) {
    console.log("[Meet OBS] Meeting ended detected");
    alreadyStopped = true;
    chrome.runtime.sendMessage({ type: "MEETING_ENDED" });
  }

  // Case 2: Reset flag if user rejoins (detect "Join now" button)
  if (alreadyStopped && bodyText.includes("Join now")) {
    console.log("[Meet OBS] User is back on pre-join screen, resetting flag");
    alreadyStopped = false;
  }
}

// Observe DOM changes
const observer = new MutationObserver(() => checkMeetingState());
observer.observe(document.body, { childList: true, subtree: true });

// Run once at load
checkMeetingState();
