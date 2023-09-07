// Function to save a clipping to local storage (making sure it's unique)
function saveTexlip(text) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('clippings', function (result) {
      const clippings = result.clippings || [];

      // Check if the clipping already exists
      if (!clippings.includes(text)) {
        clippings.push(text);

        chrome.storage.local.set({ clippings: clippings }, function () {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            // Clipping saved successfully
            console.log('Clipping saved:', text);
            resolve();
          }
        });
      } else {
        // Clipping is a duplicate, do not save it
        console.log('Clipping is a duplicate, not saved:', text);
        resolve();
      }
    });
  });
}

// Function to insert a clipping into an input field
function insertClipping(clipping, tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (clipping) => {
      const activeElement = document.activeElement;
      if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
        activeElement.value = clipping;
      }

      console.log("Clipping inserted:", clipping);
    },
    args: [clipping],
  });
}

// Function to update the context menu with the latest clippings
function updateContextMenu() {
  chrome.storage.local.get('clippings', function (result) {
    const clippings = result.clippings || [];
    createContextMenu(clippings);
  });
}

// Function to create a submenu item for each clipping
function createClippingMenuItem(clipping) {
  chrome.contextMenus.create({
    id: clipping,
    parentId: "clippingsMenu",
    title: clipping,
    contexts: ["editable"],
  });
}

// Function to create the context menu with clippings
function createContextMenu(clippings) {
  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: "clippingsMenu",
      title: "Texlips",
      contexts: ["editable"],
    });

    chrome.contextMenus.create({
      id: "saveTexlip",
      title: "Save Clip",
      contexts: ["selection"],
    });

    clippings.forEach(createClippingMenuItem);
  });
}

// Listen for changes to the stored clippings
chrome.storage.local.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local" && "clippings" in changes) {
    const newClippings = changes.clippings.newValue || [];
    createContextMenu(newClippings);
  }
});

// Initialize the context menu with stored clippings
chrome.storage.local.get('clippings', function (result) {
  const clippings = result.clippings || [];
  // Sort clippings alphabetically
  clippings.sort();
  createContextMenu(clippings);
});

// Handle context menu item click
chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  if (info.menuItemId === "saveTexlip") {
    const selectedText = info.selectionText;
    try {
      await saveTexlip(selectedText);
      updateContextMenu(); // Update the context menu after saving a clipping
    } catch (error) {
      console.error('Error saving clipping:', error);
      // Handle the error (e.g., show a message to the user)
    }
  } else {
    const selectedClipping = info.menuItemId;
    if (selectedClipping) {
      insertClipping(selectedClipping, tab);
    }
  }
});

// Listen for the context menu to be shown
chrome.contextMenus.onShown.addListener(function () {
  // Update the context menu every time it is shown
  updateContextMenu();
});


