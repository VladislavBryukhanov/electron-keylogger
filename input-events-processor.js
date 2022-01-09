module.exports = class InputEventsProcessor {
    eventsQueue = [];
    #lastMouseEventDate;
    scenarioLocked = false;

    handler = (event) => {
        const timeDelay = this.#lastMouseEventDate 
            ? Date.now() - this.#lastMouseEventDate 
            : 0;

        this.eventsQueue.push({ timeDelay, ...event });
        this.#lastMouseEventDate = Date.now();
    }

    processor = (handler) => async () => {
        let targetEvent;
        const scenarioCopy = this.eventsQueue.slice();

        while (targetEvent = scenarioCopy.shift()) {
            if (this.scenarioLocked) return;

            await new Promise((res) => setTimeout(res, targetEvent.timeDelay));
            handler(targetEvent);
        }
    }
}