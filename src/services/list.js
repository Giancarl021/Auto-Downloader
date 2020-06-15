const createFileWatcher = require('../util/watcher');
const createFileHandler = require('../util/file');
const createDownloader = require('./donwload');
const createProgressHandler = require('../util/progress');
const {
    exec
} = require('child_process');

const {
    path,
    parallelDonwloads,
    postDownload
} = require('../../data/configs.json');

module.exports = function () {
    const list = createFileHandler(path.queue);
    let watcher;
    let downloads = 0;

    function start() {
        createList();
        checkList();

        watcher = createFileWatcher(list.path);
        watcher.subscribe(checkList, 'change');
        watcher.subscribe(createList, 'unlink');
    }

    async function stop() {
        await watcher.close();
    }

    function checkList() {
        if (downloads === parallelDonwloads) return;
        const links = getLinks();

        const l = Math.min(parallelDonwloads - downloads, parallelDonwloads, links.length);
        for (let i = 0; i < l; i++) {
            const {
                url,
                filename
            } = links[i];

            const progHandler = createProgressHandler(filename);
            const downloader = createDownloader(url)

            downloader.subscribe(progHandler.update, 'progress');
            downloader.subscribe(progHandler.error, 'error');
            downloader.subscribe(progHandler.end, 'end');
            downloader.subscribe(completeDownload, 'end');

            downloader.download(filename);
            downloads++;
        }
    }

    function completeDownload(url, filename) {
        const links = getLinks();
        const index = links.findIndex(item => item.url === url);
        links.splice(index, 1);
        list.save(links.map(item => item.url + ' > ' + item.filename).join('\n'));

        if (postDownload) {
            const file = createFileHandler(filename);
            const command = postDownload
                .replace('%filename%', filename)
                .replace('%filepath%', file.path)
                .replace('%filedir%', file.path.split('/').slice(0, -1).join('/'))
            exec(command)
                .catch(console.log);
        }
        downloads--;
    }

    function createList() {
        if (!list.exists()) list.save('');
    }

    function getLinks() {
        return list.load()
            .split(/\r{0,1}\n/)
            .filter(link => link.trim())
            .map(link => {
                const [url, filename] = link.split('>').map(e => e.trim());
                return {
                    url,
                    filename: filename || ('download-' + url.replace(/[^a-zA-Z0-9]/g, ''))
                }
            });
    }

    return {
        start,
        stop
    }
}