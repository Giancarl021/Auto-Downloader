const createFileWatcher = require('../util/watcher');
const createDirectoryHandler = require('../util/directory');
const createFileHandler = require('../util/file');
const createDownloader = require('./download');
const createProgressHandler = require('../util/progress');
const createHash = require('../util/hash');
const {
    exec
} = require('child_process');

module.exports = function (configs) {
    const {
        path,
        parallelDownloads,
        postDownload,
        historySize
    } = configs;

    const list = createFileHandler(path.queue + '/queue.list');
    let watcher;
    let downloads = [];
    const operations = {
        '!': hash => {
            const download = downloads.find(item => item.hash === hash);
            if(download) download.downloader.cancel();
            else removeOperation(hash, '!');
        }
    };

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
        const links = getLinks();
        if (downloads.length === parallelDownloads) return;

        const l = Math.min(parallelDownloads - downloads.length, parallelDownloads, links.length);
        for (let i = 0; i < l; i++) {
            const {
                url,
                filename,
                hash
            } = links[i];

            if(downloads.some(download => download.hash === hash)) {
                removeDownload(url);
                continue;
            };

            const progHandler = createProgressHandler(filename, path, historySize);
            const downloader = createDownloader(url, path.output)
            
            downloader.subscribe(progHandler.update, 'progress');
            downloader.subscribe(progHandler.error, 'error');
            downloader.subscribe(progHandler.end, 'end');
            downloader.subscribe(progHandler.cancel, 'cancel');

            downloader.subscribe(cancelDownload, 'error');
            downloader.subscribe(cancelDownload, 'cancel');
            downloader.subscribe(completeDownload, 'end');

            removeDownload(url);
            downloader.download(filename);
            downloads.push({
                hash,
                downloader
            });
        }
    }

    function cancelDownload(url, filename, message) {
        removeDownloadFromQueue(url, filename);
        const lines = getLines();
        
        list.save(lines.filter(line => line.charAt(0) !== '!').join('\n'));
    }

    function completeDownload(url, filename) {
        if(!isOnQueue(url, filename)) return;
        removeDownloadFromQueue(url, filename);
        if (postDownload) {
            const file = createFileHandler(filename);
            const command = postDownload
                .replace('%filename%', filename)
                .replace('%filepath%', file.path)
                .replace('%filedir%', file.path.split('/').slice(0, -1).join('/'))
            exec(command)
                .catch(console.log);
        }
    }

    function removeDownload(url) {
        const links = getLinks();
        const index = links.findIndex(item => item.url === url);
        links.splice(index, 1);
        list.save(links.map(item => item.url + ' > ' + item.filename).join('\n'));
    }

    function removeOperation(hash, operation) {
        const lines = getLines();
        const index = lines.findIndex(e => e === operation + hash);
        lines.splice(index, 1);
        list.save(lines);
    }

    function isOnQueue(url, filename) {
        const hash = createHash(filename);
        return downloads.map(e => e.hash).includes(hash);
    }

    function removeDownloadFromQueue(url, filename) {
        const hash = createHash(filename);
        downloads.splice(downloads.findIndex(e => e.hash === hash), 1);
    }

    function createList() {
        if (!list.exists()) list.save('');
    }

    function getLinks() {
        const lines = getLines();
        const links = lines
            .map(link => {
                const operation = operations[link.charAt(0)];
                if(operation) {
                    operation(link.slice(1));
                    return null;
                }
                let [url, filename] = link.split('>').map(e => e.trim());
                if(!filename) filename = 'download-' + url.replace(/[^a-zA-Z0-9]/g, '');
                const dir = getDir(filename);

                if(/!$/.test(filename)) {
                    dir.make(true);
                    filename = filename.substr(0, filename.length - 1);
                }

                const hash = createHash(filename);
                return {
                    url,
                    filename,
                    hash
                }
            });

        const linksMap = {};
        for(const item of links) {
            if(!item) continue;
            linksMap[item.hash] = item;
        }

        return Object.values(linksMap);

        function getDir(filename) {
            const arr = filename.split('/');
            arr.unshift(path.output);
            arr.pop();
            return createDirectoryHandler(arr.join('/'));
        }
    }

    function getLines() {
        return list.load()
            .split(/\r{0,1}\n/)
            .filter(link => link.trim());
    }

    return {
        start,
        stop
    }
}