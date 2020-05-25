const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let win = null;

function createWindow() {

    console.log('createWindow() started...');

    const options = {
        backgroundColor: '#1da1f2',
        width: 600,
        height: 450,
        frame: true,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    };

    win = new BrowserWindow(options);
    win.loadURL(url.format({
        pathname: path.join(__dirname, `index.html`),
        protocol: 'file',
        slashes: true
    }));

    win.on('closed', () => {
        win = null;
    });

    win.on('ready-to-show', () => {
        win.show();
    });

    console.log('createWindow() finished...');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        console.log('App closed!');
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
