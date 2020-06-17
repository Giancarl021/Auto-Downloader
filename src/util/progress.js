const createJsonHandler = require('./json');
const { path, historySize } = require('../../data/configs.json');
const createHash = require('./hash');

module.exports = function (name) {

    let _lock = false;
    const prg = createJsonHandler(path.progress + '/progress.json');
    const err = createJsonHandler(path.errors + '/errors.json');
    const fin = createJsonHandler(path.finished + '/finished.json');
    const can = createJsonHandler(path.canceled + '/canceled.json');

    function update(url, filename, state) {
        const progress = prg.exists() ? prg.load() : {};
        progress[name] = {
            url,
            filename,
            hash: createHash(filename),
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
        const canceled = can.exists() ? can.load() : [];
        canceled.unshift({
            url,
            filename: name
        });

        while(canceled.length > historySize) {
            canceled.pop();
        }

        can.save(canceled);
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