function saveOptions(e) {
	let stateElem = document.querySelector("#state");
    let instructions = document.querySelector("#refresh");

    e.preventDefault();
    if (stateElem.value == "Click to disable") {
      state = "disabled";
	  stateElem.value = "Click to enable";
    }
    else {
      state = "enabled";
	  stateElem.value = "Click to disable";
    }
    if ( instructions.style.display == "none") {
      instructions.style.display = "block";
    }
    else {
      instructions.style.display = "none";
    }
    browser.storage.local.set({
      state: state
    });
}
  
function restoreOptions() {
    function setCurrentChoice(result) {
    	if (result.state == "disabled") {
        	document.querySelector("#state").value = "Click to enable";
    	}
    }
  
    function onError(error) {
    	console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.local.get("state");
    getting.then(setCurrentChoice, onError);
}
  
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#state").addEventListener("click", saveOptions);
  
