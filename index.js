const { shell, ipcRenderer } = require('electron');
const { chromium } = require('playwright');
const path = require('path');


const takeScreenshot = async (tweetUrl, theme, lang) => {

    let response;

    if (! tweetUrl) {
        return {
            error: true,
            message: 'URL is required!'
        }
    }

    const isValidUrl = tweetUrl.match(/^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/);
    if (! isValidUrl) {
        return {
            error: true,
            message: 'Tweet URL is invalid. You should use a Tweet status URL.'
        }
    }

    // Params
    const date = (new Date()).toISOString();

    const tweetURLParts = tweetUrl.split('/');
    const tweetID = tweetURLParts[tweetURLParts.length - 1];

    const browser = await chromium.launch();
    const page = await browser.newPage();

    let screenshotURL = 'https://publish.twitter.com/';
    screenshotURL += '?query=' + encodeURIComponent(tweetUrl);
    screenshotURL += '&theme=' + theme;
    screenshotURL += '&lang=' + lang;
    screenshotURL += '&widget=Tweet';

    await page.goto(screenshotURL).catch(error => console.log('page:', error));

    console.log('Loading tweet...');
    await page.waitForTimeout(2000);

    const tweet = await page.$('.twitter-tweet');
    if (tweet) {
        const filename = `tweetshot-${tweetID}-${theme}-${lang}.png`;
        await tweet.screenshot({
            path: path.join(__dirname, 'shots', filename)
        });
        
        console.log('Screenshot created!');
        
        response = {
            success: true,
            message: 'Screenshot created!',
            filename: filename
        };

    } else {
        console.log('Screenshot failed!');
        
        response = {
            error: true,
            message: 'Screenshot failed!'
        }

    }

    await browser.close();

    return response;
};

let filePath;

const tweetUrlField = document.getElementById('url');

const goBtn = document.getElementById('go');
const openFileBtn = document.getElementById('open-file');
const openFolderBtn = document.getElementById('open-folder');

function disableButtons() {
    openFileBtn.disabled = true;
    openFolderBtn.disabled = true;
}

function enableButtons() {
    const disabledClass = ['cursor-not-allowed', 'opacity-75'];
    openFileBtn.classList.remove(...disabledClass);
    openFolderBtn.classList.remove(...disabledClass);
    openFileBtn.disabled = false;
    openFolderBtn.disabled = false;
}

disableButtons();

goBtn.addEventListener('click', async (event) => {

    const originalLabel = goBtn.innerText;

    // Disable Create Button while screenshot is pending
    goBtn.disabled = true;
    goBtn.querySelector('span').innerText = 'Loading...';

    const tweetUrl = tweetUrlField.value;
    const theme = document.getElementById('theme').value;
    const lang = document.getElementById('lang').value;

    const screenshot = await takeScreenshot(tweetUrl, theme, lang);
    if (screenshot.error) {
        console.log(`Error: ${screenshot.message}`);
        new Notification('Error!', {
            body: screenshot.message
        });
    } else {
        new Notification('Success!', {
            body: screenshot.message
        });
        filePath = path.join(__dirname, 'shots', screenshot.filename);

        // Enable buttons to see the screenshot
        enableButtons();
    }

    // Enable Create Button
    goBtn.querySelector('span').innerText = originalLabel;
    goBtn.disabled = false;
    
});

openFileBtn.addEventListener('click', (event) => {
    shell.openPath(filePath);
    console.log('File Location: ' + filePath);
});

openFolderBtn.addEventListener('click', (event) => {
    console.log('Folder Location: ' + filePath);
    shell.showItemInFolder(filePath);
});
