# Auto Downloader

## Installation

**npm**

```bash
npm install auto-downloader
```

**Yarn**
```bash
yarn add auto-downloader
```

## Configuration

You can customize the default behavior of the Auto Downloader in the [configuration file](data/configs.json)

Here are the defaults:

```json
{   
    "path": {
        "errors": "data/var",
        "progress": "data/var",
        "canceled": "data/var",
        "finished": "data/var",
        "queue": "."
    },
    "output": "downloads",
    "parallelDonwloads": 3,
    "postDownload": null
}
```

``path``: The directories used in the application.
``path.errors``: The directory that the errors of the downloads will be saved. The ``errors.json`` file have this format:
```json
{
	"url": "...",
	"filename": "...",
	"message": "..."
}
```

``path.progress``: The directory that the progress of the downloads will be saved. The filename is ``progress.json``. The format is generated by [request-progress](https://www.npmjs.com/package/request-progress):

```js
{
    "download-link": {
        "time": {
            "elapsed": 0, // The total elapsed seconds since the start (3 decimals)
            "remaining": 0 // The remaining seconds to finish (3 decimals)
        },
        "speed": 0, // The download speed in bytes/sec
        "percent": 0, // Overall percent (between 0 to 1)
        "size": {
            "total": 0, // The total payload size in bytes
            "transferred": 0 // The transferred payload size in bytes
        }
    }
}
```
``path.canceled``: The directory that the information of canceled downloads will be saved. The ``canceled.json`` have this format:
```json
[
    {
        "url": "...",
        "filename": "..."
    }
]
```
``path.finished``: The directory that the information of completed downloads will be saved. The ``finished.json`` have this format:

```json
[
    {
        "url": "...",
        "filename": "..."
    }
]
```
``path.queue``: The location of the file with the links to downloads. The format is [here](#usage).
``output``: The directory where the files will be downloaded.
``parallelDownloads``: The number of downloads performed at the same time.
``postDownload``: An shell command with will be executed when the downloads are finished. The command will have access to three constants of the download:
  ``%filename%``: The name of the file downloaded with extension.
  ``%filedir%``: The name of the directory that the file has been downloaded.
  ``%filepath%``: The absolute path to the file downloaded.

## <a name="usage">Usage</a>

To use the file, run ``npm start`` or ``yarn start`` on the project directory. Then the ``queue.list`` file will appear on the path that you configured.

#### Download

You can paste on this file every link that you want to download.
By default, the filename of the downloads will be ``download-<link>`` without extension. To save the file with an specific name and extension, you could the ``>`` operator:

```
link > filename.extension
```

You can use absolute paths too:

```
link > /home/user/filename.extension
```

#### Cancel Downloads

In the ``progress.json`` file, in addition to the downloads information, you will have the ``hash`` key in each download of the array. You can copy this hash and use the ``!`` operator to cancel that download:

```
!hash
```