var currentBrowser;
if (typeof chrome === 'undefined') {
    currentBrowser = browser;
} else {
    currentBrowser = chrome;
}

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
    if (instructions.style.display == "none") {
        instructions.style.display = "block";
    }
    else {
        instructions.style.display = "none";
    }
    currentBrowser.storage.local.set({
        state: state
    });
}

function setCurrentChoice(result) {
    if (result.state == "disabled") {
        document.querySelector("#state").value = "Click to enable";
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function restoreOptions() {
    let getting = currentBrowser.storage.local.get("state");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#state").addEventListener("click", saveOptions);

