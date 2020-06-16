const createJsonHandler = require('./json');
const { path, historySize } = require('../../data/configs.json');
const createHash = require('./hash');

module.exports = function (name) {

    let _lock = false;
    const prg = createJsonHandler(path.progress);
    const err = createJsonHandler(path.errors);
    const fin = createJsonHandler(path.finished);
    const can = createJsonHandler(path.cancelled);

    function update(url, filename, state) {
        const progress = prg.exists() ? prg.load() : {};
        progress[name] = {
            url,
            filename,
            hash: createHash(url + filename),
            state
        };
        prg.save(progress);
    }

    function error(url, filename, error) {
        const errors = err.exists() ? err.load() : [];
        errors.unshift({
            url,
            filename,
            message: error.message
        });

        while(errors.length > historySize) {
            errors.pop();
        }

        err.save(errors);
        removeFromProgress();
    }

    function end(url) {
        if(_lock) return;
        const finished = fin.exists() ? fin.load() : [];
        finished.unshift({
            url,
            filename: name
        });

        while(finished.length > historySize) {
            finished.pop();
        }

        fin.save(finished);
        removeFromProgress();
    }

    function cancel(url) {
        const cancelled = can.exists() ? can.load() : [];
        cancelled.unshift({
            url,
            filename: name
        });

        while(cancelled.length > historySize) {
            cancelled.pop();
        }

        can.save(cancelled);
        _lock = true;
        removeFromProgress();
    }

    function removeFromProgress() {
        if(!prg.exists()) return;
        const progress = prg.load();
        delete progress[name];
        prg.save(progress);
    }

    return {
        update,
        error,
        end,
        cancel
    }
}