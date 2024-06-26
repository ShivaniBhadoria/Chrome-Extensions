chrome.runtime.onMessage.addListener(function(message) {

    if (message.type === 'limitReached') {
        chrome.notifications.clear('limitNotif');

        chrome.notifications.create('limitNotif', {
            type: 'basic',
            iconUrl: 'assets/money128.png',
            title: 'Budget Limit Reached',
            message: "Uh oh! Looks like you've hit your spending limit!",
        });
    } else if (message.type === 'spendReset') {
        chrome.notifications.clear('spendReset');

        chrome.notifications.create('spendReset', {
            type: 'basic',
            iconUrl: 'assets/money128.png',
            title: 'Total spend reset',
            message: "Total spend has been reset to 0!",
        });
    }
});

let contextMenuItem = {
    "id": "spendMoney",
    "title": "SpendMoney",
    "contexts": ["selection"]
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create(contextMenuItem);
});

function isInteger(value) {
    return !isNaN(value) && parseInt(Number(value)) == value &&
            !isNaN(parseInt(value, 10));
}

chrome.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId == 'spendMoney' && clickData.selectionText) {
        if(isInteger(clickData.selectionText)) {
            chrome.storage.sync.get(['total', 'limit'], function(budget){
                let newTotal = 0;
                if(budget.total) {
                    newTotal += parseInt(budget.total);
                }
                newTotal += parseInt(clickData.selectionText);

                chrome.storage.sync.set({'total': newTotal}, function(){
                    if(newTotal >= budget.limit) {
                        chrome.runtime.sendMessage({ type: 'limitReached' });
                    }
                });
            });
        }
    }
});

chrome.storage.onChanged.addListener(function(changes, storageArea) {
    if (changes.total && storageArea === "sync") {
        chrome.action.setBadgeText({
            text: changes.total.newValue.toString()
        });
        chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    }
});