const createJsonHandler = require('./json');
const { path } = require('../../data/configs.json');

module.exports = function (name) {

    const prg = createJsonHandler(path.progress);
    const err = createJsonHandler(path.errors);
    const fin = createJsonHandler(path.finished);

    function update(state) {
        const progress = prg.exists() ? prg.load() : {};
        progress[name] = state;
        prg.save(progress);
    }

    function error(error) {
        const errors = err.exists() ? err.load() : {};
        errors[name] = error.message;
        err.save(errors);
        removeFromProgress();
    }

    function end(url) {
        const finished = fin.exists() ? fin.load() : [];
        finished.push({
            url,
            filename: name
        });
        fin.save(finished);
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
        end
    }
}