require('dotenv').config();
const createEnvironmentHandler = require('./src/services/environment');
const createFileWatcher = require('./src/services/watcher');

async function main() {
    const env = createEnvironmentHandler();
    env.create();

    const watcher = createFileWatcher('data/queue.json');
    watcher.subscribe(console.log);
    
}

main().catch(console.log);