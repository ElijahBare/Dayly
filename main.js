const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const os = require('os');

function createWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    // Open the DevTools.
    // win.webContents.openDevTools();

    win.on('closed', () => {

        win = null;
    });
}

app.whenReady().then(() => {

    // Create the browser window
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {

        app.quit();
});
