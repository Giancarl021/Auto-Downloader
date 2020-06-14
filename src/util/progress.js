const createJsonHandler = require('./json');

const masterPath = process.env.DATA;
const errorPath = process.env.ERRORS;
const progressPath = process.env.PROGRESS;
const finishedPath = progress.env.FINISHED;

module.exports = function (name) {

    const prg = createJsonHandler(`${masterPath}/${progressPath}`);
    const err = createJsonHandler(`${masterPath}/${errorPath}`);
    const fin = createJsonHandler(`${masterPath}/${finishedPath}`);

    function update(state) {
        const progress = prg.exists() ? prg.load() : {};
        progress[name] = state;
        prg.save(progress);
    }

    function error(error) {
        const errors = err.exists() ? err.load() : {};
        errors[name] = error.message;
        removeFromProgress();
    }

    function end() {
        const finished = fin.exists() ? fin.load() : [];
        finished.push(name);
        fin.save(finished);
        removeFromProgress();
    }

    function removeFromProgress() {
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