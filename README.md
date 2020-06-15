# Auto Downloader

### Installation

**NPM**
```bash
npm install -g auto-downloader
```

**Yarn**
```bash
yarn add global auto-downloader
```

### Configuration

You can customize the default behavior of the Auto Downloader in the [configuration file](data/configs.json)

Here are the defaults:

```json
{   
    "path": {
        "errors": "data/var/errors.json",
        "progress": "data/var/progress.json",
        "finished": "data/var/finished.json",
        "queue": "queue.list"
    },
    "output": "downloads",
    "parallelDonwloads": 3,
    "postDownload": null
}
```

``path``: The data about the location of the files used.
``path.errors``: The location of the errors in downloads. The erros file have this format:
```json
"WIP"
```

``path.progress``: The location of the progress during the downloads. The format is generated by [request-progress](https://www.npmjs.com/package/request-progress):

```json
{
    "download-link": {
        "time": {
            "elapsed": 55.255, // The total elapsed seconds since the start (3 decimals)
            "remaining": 517.85 // The remaining seconds to finish (3 decimals)
        },
        "speed": 272485.8564835761, // The download speed in bytes/sec
        "percent": 0.09641337730370372, // Overall percent (between 0 to 1)
        "size": {
            "total": 156163039, // The total payload size in bytes
            "transferred": 15056206 // The transferred payload size in bytes
        }
    }
}
```
``path.finished``: The location of the completed downloads. The finished downloads file have this format:
```json
[
    {
        "url": "...",
        "filename": "..."
    }
]
```
``path.queue``: The location of the file with the links to downloads. The format is [here]().