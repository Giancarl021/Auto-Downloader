const createDirectoryHandler = require('../util/directory');

module.exports = function() {

    const data = createDirectoryHandler('data');

    function create() {
        data.make(true);
        createDirectoryHandler('downloads').make();
    }

    function destroy() {
        data.remove(true);
    }

    return {
        create,
        destroy
    }
}