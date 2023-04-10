const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');
const os = require('os');

let backend;

function startBackend() {
    let backendExecutable;
    switch (os.platform()) {
        case 'win32':
            backendExecutable = 'backend/backend.exe';
            break;
        case 'darwin':
            backendExecutable = 'backend/backend_mac';
            break;
        case 'linux':
            backendExecutable = 'backend/backend_linux';
            break;
    }

    if (backendExecutable) {
        backend = spawn(path.join(__dirname, backendExecutable));
        backend.stdout.on('data', (data) => {
            console.log(`Backend stdout: ${data}`);
        });
        backend.stderr.on('data', (data) => {
            console.error(`Backend stderr: ${data}`);
        });
        backend.on('close', (code) => {
            console.log(`Backend exited with code ${code}`);
        });
    } else {
        console.error('Unsupported platform.');
    }
}

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
        backend.kill('SIGINT');

        win = null;
    });
}

app.whenReady().then(() => {
    startBackend();

    // Create the browser window
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
        backend.kill('SIGINT');

        app.quit();
});
