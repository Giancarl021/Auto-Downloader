const request = require('request');
const fs = require('fs');
const progress = require('request-progress');

const {
    join,
    isAbsolute
} = require('path');

const {
    output
} = require('../../data/configs.json').path;

module.exports = function (url) {
    const subscriptions = {
        progress: [],
        end: [],
        error: []
    };

    async function download(filename) {
        const savePath = isAbsolute(filename) ? filename : join(output, filename);
        try {
            await new Promise((resolve) => {
                progress(request.get(url))
                    .on('progress', (...args) => {
                        notify('progress', args);
                    })
                    .on('error', (...args) => {
                        notify('error', args);
                        resolve();
                    })
                    .on('end', (...args) => {
                        notify('end', [url, filename, ...args]);
                        resolve();
                    })
                    .pipe(fs.createWriteStream(savePath));
            });
        } catch (error) {
            notify('error', [error]);
        }
    }

    function subscribe(fn, event = 'end') {
        if (!Object.keys(subscriptions).includes(event)) throw new Error('This event does not exists');
        subscriptions[event].push(fn);
    }

    function notify(event, args) {
        for (const fn of subscriptions[event]) {
            fn(...args);
        }
    }

    return {
        download,
        subscribe
    }
}