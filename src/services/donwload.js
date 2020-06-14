const request = require('request');
const fs = require('fs');
const progress = require('request-progress');
const createProgressHandler = require('../util/progress');

module.exports = async function (url, filename) {
    const progHandler = createProgressHandler(filename);
    return new Promise((resolve) => {
        progress(request.get(url))
            .on('progress', progHandler.update)
            .on('error', err => {
                progHandler.error(err);
                resolve();
            })
            .on('end', () => {
                progHandler.end();
                resolve();
            })
            .pipe(fs.createWriteStream(filename));
    });
}