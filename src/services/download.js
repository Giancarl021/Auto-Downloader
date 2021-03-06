const request = require('request');
const fs = require('fs');
const progress = require('request-progress');

const {
    join,
    isAbsolute
} = require('path');

module.exports = function (url, output) {
    let requester, _filename, _path;
    const subscriptions = {
        progress: [],
        end: [],
        cancel: [],
        error: []
    };

    async function download(filename) {
        _filename = filename;
        const savePath = isAbsolute(filename) ? filename : join(output, filename);
        _path = savePath;
        const fileStream = fs.createWriteStream(savePath).on('error', fileStreamError);
        try {
            await new Promise((resolve) => {
                requester = request.get(url);
                progress(requester)
                    .on('progress', (...args) => {
                        notify('progress', [url, filename, ...args]);
                    })
                    .on('error', (...args) => {
                        notify('error', [url, filename, ...args]);
                        resolve();
                    })
                    .on('end', (...args) => {
                        notify('end', [url, filename, ...args]);
                        resolve();
                    })
                    .pipe(fileStream);
            });
        } catch (error) {
            notify('error', [url, filename, error]);
        }
    }

    function cancel(message = 'Canceled manually') {
        requester.abort(message);
        fs.unlinkSync(_path);
        notify('cancel', [url, _filename, message]);
    }

    function fileStreamError(error) {
        requester.abort(error.message);
        notify('error', [url, _filename, error]);
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
        cancel,
        subscribe
    }
}