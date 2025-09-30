let alreadyStopped = false;

function checkMeetingState() {
  const bodyText = document.body.innerText || '';

  if (!alreadyStopped && bodyText.includes('You left the meeting')) {
    console.log('[Meet OBS] Meeting ended detected');
    alreadyStopped = true;
    chrome.runtime.sendMessage({ type: 'MEETING_ENDED' });
  }

  if (alreadyStopped && bodyText.includes('Join now')) {
    console.log('[Meet OBS] User rejoined, resetting flag');
    alreadyStopped = false;
  }
}

const observer = new MutationObserver(() => checkMeetingState());
observer.observe(document.body, { childList: true, subtree: true });

checkMeetingState();
