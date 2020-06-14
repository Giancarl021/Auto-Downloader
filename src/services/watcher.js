const filewatcher = require('chokidar');

module.exports = function (path) {
    const subscriptions = {
        all: [],
        add: [],
        addDir: [],
        change: [],
        unlink: [],
        unlinkDir: [],
        ready: [],
        raw: [],
        error: []
    };

    const watcher = filewatcher.watch(path);

    for (const event in subscriptions) {
        watcher.on(event, (...args) => notify(event, args));
    }

    function notify(event, args) {
        for (const fn of subscriptions[event]) {
            fn(...args);
        }
    }

    function subscribe(fn, event = 'all') {
        const length = subscriptions[event].push(fn);
        return length - 1;
    }

    function removeSubscription(index) {
        subscriptions.splice(index, 1);
    }

    async function close() {
        await watcher.close();
    }

    return {
        subscribe,
        removeSubscription,
        close
    }
}