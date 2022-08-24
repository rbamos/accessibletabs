convert.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("click listener")
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: parse_page,
    });
  });