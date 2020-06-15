const createListController = require('./src/services/list');

async function main() {
    const list = createListController();
    list.start();
}

main().catch(console.log);