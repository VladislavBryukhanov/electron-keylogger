const robot = require('robotjs');
const ioHook = require('iohook');
const debounce = require('lodash/debounce');
const { initWindow, parseKeyEvent } = require('./utils');
const InputEventsProcessor = require('./input-events-processor');

const main = async () => {
    await initWindow();

    const mouseClickEventProcessor = new InputEventsProcessor();
    const mouseMoveEventProcessor = new InputEventsProcessor();
    const keyboardEventProcessor = new InputEventsProcessor();
    
    const processMouseClickEvents = mouseClickEventProcessor.processor((targetEvent) => {
        console.log("E", targetEvent)
        const buttonType = {
            1: 'left',
            2: 'right',
        }[targetEvent.button];

        const clickType = {
            'mouseup': 'up',
            'mousedown': 'down',
        }[targetEvent.type];

        robot.moveMouse(targetEvent.x, targetEvent.y);
        robot.mouseToggle(clickType, buttonType);
    });

    const processMouseMoveEvents = mouseMoveEventProcessor.processor(
        targetEvent => robot.moveMouse(targetEvent.x, targetEvent.y)
    );

    const processKeyClickEvents = keyboardEventProcessor.processor(
        targetEvent => robot.keyTap(parseKeyEvent(targetEvent))
    );


    // ctrl + f7 / shift + f7
    ioHook.registerShortcut(['29', '100'], (keys) => {
        console.log("REGISTER");
        keyboardEventProcessor.eventsQueue = [];
        mouseClickEventProcessor.eventsQueue = [];
        mouseMoveEventProcessor.eventsQueue = [];

        ioHook.on('mouseup', mouseClickEventProcessor.handler);
        ioHook.on('mousedown', mouseClickEventProcessor.handler);
        // ioHook.on('mousemove', mouseMoveEventProcessor.handler);
        // ioHook.on('keyup', keyboardEventProcessor.handler);
    });
    ioHook.registerShortcut(['42', '100'], (keys) => {
        console.log("STOP REGISTERING");
        ioHook.removeListener('mouseup', mouseClickEventProcessor.handler);
        ioHook.removeListener('mousedown', mouseClickEventProcessor.handler);
        // ioHook.removeListener('mousemove', mouseMoveEventProcessor.handler);
        // ioHook.removeListener('keyup', keyboardEventProcessor.handler);
    });

    // ctrl + f6 / shift + f6
    ioHook.registerShortcut(['29', '57369'], (keys) => {
        console.log("START SCENARIO");
        mouseClickEventProcessor.scenarioLocked = false;
        mouseMoveEventProcessor.scenarioLocked = false;
        keyboardEventProcessor.scenarioLocked = false;

        return Promise.all([
            // UNSTABLE - drag & drop doesn't work
            processMouseClickEvents(),

            // UNSTABLE - listener has too many events and it is quite difficult to process all the events => processing is too slow, 
            // for example if we move cursor for 1 second the processor will reproduce this scenario for a 5 seconds.
            // eventSkipper util can skip some important events if the skipValue > 5 and processing still to slow if skipValue < 15
            // debounce skips some important moves of cursor if moving is smooth
            // processMouseMoveEvents(),

            // UNSTABLE - after processing running - it fires duplicated shortcut event and this listener runned twice => each button click event is duplicated
            // also the keyboardHandler can only recognize simple characters, like 'a-z', 1-9, ctrl, enter, etc. 
            // But the app crashes if some specific button typed, for example "f1", "~", etc 
            // processKeyClickEvents(),
        ]);
    });
    ioHook.registerShortcut(['42', '57369'], (keys) => {
        console.log("STOP SCENARIO");
        mouseClickEventProcessor.scenarioLocked = true;
        mouseMoveEventProcessor.scenarioLocked = true;
        keyboardEventProcessor.scenarioLocked = true;
    });

    ioHook.start();
};
main();


// npx electron-rebuild -f -t prod,optional,dev -w robotjs
// .\node_modules\.bin\electron-rebuild.cmd
