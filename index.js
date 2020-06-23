const createListController = require('./src/services/list');

const _options = require('./data/configs.json');

async function main(options = _options) {
    const list = createListController(options);
    list.start();
}

module.exports = main;