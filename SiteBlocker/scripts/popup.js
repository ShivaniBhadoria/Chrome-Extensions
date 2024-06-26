
let activeTabUrl;
let activeHostName;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    activeTabUrl = tabs[0].url;
    activeHostName = new URL(tabs[0].url).hostname;
    document.getElementById("active-tab").innerText = activeHostName;
})

function displayError(text) {
    let div = document.createElement('div');
    div.setAttribute('id', 'error-mssg');
    div.innerHTML = `
                <div class="error">
                    <p>${text}</p>     
                </div>`
    document.getElementsByClassName("error-container")[0].appendChild(div);

    setTimeout(() => {
        document.getElementById("error-mssg").remove();
    }, 3000)
}

//$('#amountErrorMsg').text('Please enter a valid positive number for the spent amount.').addClass('errorMssg').fadeIn().delay(2000).fadeOut();

document.getElementById("blockBtn").addEventListener("click", () => {

    const blockBtn = document.getElementById("blockBtn");

    blockBtn.classList.add('onClick');
    setTimeout(() => {
        blockBtn.classList.remove('onClick');
    }, 400);

    if (activeTabUrl.toLowerCase().includes("chrome://")) {
        displayError("Action denied: Chrome url cannot be blocked.");
    }
    else {
        chrome.storage.local.get("blockedSites", (data) => {
            if (data.blockedSites === undefined) {
                chrome.storage.local.set({ blockedSites: [{ status: "In_Progress", url: activeHostName }] });
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { from: "popup", subject: "startTimer" }
                    );
                });

                setTimeout(() => {
                    let then = new Date();
                    then.setHours(24, 0, 0, 0);
                    const blockTill = then.getTime()

                    chrome.storage.local.set({
                        blockedSites: [{
                            status: "BLOCKED", url: activeHostName, BlockTill: blockTill
                        }]
                    })
                }, 5000);

            }
            else {
                if (data.blockedSites.some((e) => e.url === activeHostName && e.status === "In_Progress")) {
                    displayError("This site will be completely blocked after some time.")
                }
                else if (data.blockedSites.some((e) => e.url === activeHostName && e.status === "BLOCKED")) {
                    displayError("This site is blocked completely.")
                }
                else {
                    chrome.storage.local.set({ blockedSites: [...data.blockedSites, { status: "In_Progress", url: activeHostName }] })

                    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            { from: "popup", subject: "startTimer" }
                        );
                    });

                    setTimeout(() => {
                        chrome.storge.local.get("blockedSites", (data) => {
                            data.blockedSites.forEach((e, index) => {
                                if (e.url === activeHostName && e.status === 'In_Progress') {
                                    let arr = data.blockedSites.splice(index, 1);

                                    let then = new Date();
                                    then.setHours(24, 0, 0, 0);
                                    const blockTill = then.getTime()

                                    chrome.storage.local.set({ blockedSites: [...arr, { status: "BLOCKED", url: activeHostName, BlockTill: blockTill }] })
                                }
                            })
                        })


                    }, 5000);

                }
            }
        })

    }
})
