let settingsWrapper = document.querySelector('#settings-wrapper1');
let settingsForm = settingsWrapper.querySelector('.game__settings');

function toggleSettings() {
    g.pause();
    settingsWrapper.classList.toggle('hidden');
}

function confirmSettings(event) {
    let newPreferences = new Object();
    for(let p of g._preferences) {
        let el = this.querySelector(`[data-prop-name=${p}]`);
        el ? newPreferences[p] = el.value : 0;
    }
    g.setupGamePreferences(newPreferences);
    g.setupGameSession();
    g.start();
    settingsWrapper.classList.toggle('hidden');
    event.preventDefault();
}

function denySettingChanges(event) {
    settingsWrapper.classList.toggle('hidden');
    g.start();
    event.preventDefault();
}

document.querySelector('#toggle-settings-btn1').addEventListener('onclick', toggleSettings);
settingsForm.addEventListener('submit', confirmSettings);
document.querySelector('#deny-settings-btn1').addEventListener('click', denySettingChanges); // why 'onclick does not work????'