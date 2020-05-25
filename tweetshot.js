const { chromium } = require('playwright');

(async () => {

    const command = process.argv.slice(2);
    if (! command.length) {
        console.log('URL is required');
        return false;
    }

    // Params
    const tweetURL = command[0];
    const theme = command[1] || 'light';
    const lang = command[2] || 'en';
    const date = (new Date()).toISOString();

    const tweetURLParts = tweetURL.split('/');
    const tweetID = tweetURLParts[tweetURLParts.length - 1];

    const browser = await chromium.launch();
    const page = await browser.newPage();

    let screenshotURL = 'https://publish.twitter.com/';
    screenshotURL += '?query=' + encodeURIComponent(tweetURL);
    screenshotURL += '&theme=' + theme;
    screenshotURL += '&lang=' + lang;
    screenshotURL += '&widget=Tweet';

    await page.goto(screenshotURL).catch(error => console.log('page:', error));

    console.log('Loading tweet...');
    await page.waitForTimeout(2000);

    const tweet = await page.$('.twitter-tweet');
    if (tweet) {
        const filename = `shots/tweetshot-${tweetID}-${theme}-${lang}.png`;
        await tweet.screenshot({path: filename});
        console.log('Screenshot created!');
        return {
            success: true,
            file: path.join(__dirname, filename)
        };
    } else {
        console.log('Screenshot failed!');
        return {
            error: true,
            message: 'Screenshot failed!'
        }
    }

    await browser.close();
})();