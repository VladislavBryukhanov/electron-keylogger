const { app, BrowserWindow } = require('electron');
const keycode = require('keycode');

module.exports.eventSkipper = (handler, skipTries) => {
    let attemptNumber = 0;
    
    return (event) => {

        if (attemptNumber < skipTries) return attemptNumber++;
        attemptNumber = 0;

        return handler(event);
    }
}

module.exports.initWindow = async () => {
    await app.whenReady();

    const win = new BrowserWindow({
        width: 300,
        height: 300,
        acceptFirstMouse: true,
    });
    win.loadFile('index.html')
}

module.exports.parseKeyEvent = (event) => {
    switch (true) {
        case event.shiftKey: {
            return 'shift';
        }
        case event.altKey: {
            return 'alt';
        }
        case event.ctrlKey: {
            return 'control';
        }
        default: {
            return String.fromCharCode(event.rawcode)
        }
    }
}