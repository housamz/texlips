document.addEventListener('DOMContentLoaded', function () {
  const clipText = document.getElementById('clipText');
  const saveClipButton = document.getElementById('saveClip');
  const clippingList = document.getElementById('clippingList');

  // Add an event listener to the save button
  saveClipButton.addEventListener('click', function () {
    const text = clipText.value;
    if (text) {
      // Save the text clipping
      saveClipping(text);
      clipText.value = ''; // Clear the input field
    }
  });

  // Function to save a clipping to local storage
  function saveClipping(text) {
    chrome.storage.local.get('clippings', function (result) {
      const clippings = result.clippings || [];
      clippings.push(text);

      chrome.storage.local.set({ clippings: clippings }, function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        // Clipping saved successfully
        console.log('Clipping saved:', text);
        displayClippings();
      });
    });
  }

  // Function to delete a clipping
  function deleteClipping(clipping) {
    chrome.storage.local.get('clippings', function (result) {
      const clippings = result.clippings || [];
      const updatedClippings = clippings.filter(c => c !== clipping);

      chrome.storage.local.set({ clippings: updatedClippings }, function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        // Clipping deleted successfully
        console.log('Clipping deleted:', clipping);
        displayClippings();
      });
    });
  }

  // Function to display clippings in the UI
  function displayClippings() {
    chrome.storage.local.get('clippings', function (result) {
      const clippings = result.clippings || [];

      // Clear existing list
      clippingList.innerHTML = '';

      // Sort clippings alphabetically
      clippings.sort();

      // Populate the list with clippings and delete buttons
      clippings.forEach(function (clipping) {
        const li = document.createElement('li');
        li.className = 'clipping-list-item';
        const span = document.createElement('span');
        span.textContent = clipping;

        li.appendChild(span);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.addEventListener('click', function () {
          deleteClipping(clipping);
        });

        li.appendChild(deleteButton);
        clippingList.appendChild(li);
      });
    });
  }

  // Display saved clippings on popup open
  displayClippings();
});
