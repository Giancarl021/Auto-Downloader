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

    const watcher = filewatcher.watch(path, {
        awaitWriteFinish: true
    });

    for (const event in subscriptions) {
        watcher.on(event, (...args) => notify(event, args));
    }

    function notify(event, args) {
        for (const fn of subscriptions[event]) {
            fn(...args);
        }
    }

    function subscribe(fn, event = 'all') {
        if(!Object.keys(subscriptions).includes(event)) throw new Error('This event does not exists');
        subscriptions[event].push(fn);
    }

    async function close() {
        await watcher.close();
    }

    return {
        subscribe,
        close
    }
}