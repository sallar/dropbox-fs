const Dropbox = require("dropbox");

const client = new Dropbox({ accessToken: process.env.KEY });

function __convertStat(entry) {
    return Object.assign({}, entry, {
        isFile: () => entry['.tag'] === 'file',
        isDirectory: () => entry['.tag'] === 'folder'
    });
}

function __executeCallbackAsync(callback, args) {
    if (typeof setImmediate !== "undefined") {
        setImmediate(function() {
            callback.apply(null, args);
        });
    } else {
        setTimeout(function() {
            callback.apply(null, args);
        }, 0);
    }
}

function __normalizePath(remotePath) {
    if (remotePath instanceof Buffer) {
        remotePath = remotePath.toString('utf8');
    }
    if (remotePath === '/') {
        return '';
    } else if (remotePath.indexOf('./') === 0) {
        return remotePath.replace(/\.\//, '');
    }
    return remotePath;
}

function readdir(remotePath = '', options = {}, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    const mode = options.mode || 'node';

    client
        .filesListFolder({path: __normalizePath(remotePath)})
        .then(({entries}) => {
            if (mode === 'node') {
                entries = entries.map(entry => entry.name);
            } else if (mode === 'stat') {
                entries = entries.map(entry => __convertStat(entry));
            } else {
                throw new Error(`Unknow mode: ${mode}`);
            }
            __executeCallbackAsync(callback, [null, entries]);
        })
        .catch(callback);
}

function readFile(remotePath, options = {encoding: null}, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {
            encoding: null
        };
    } else if (typeof options === 'string') {
        options = {
            encoding: options
        };
    }

    const { encoding } = options;

    client
        .filesDownload({path: __normalizePath(remotePath)})
        .then(resp => {
            let buffer = Buffer.from(resp.fileBinary);
            buffer = encoding ? buffer.toString(encoding) : buffer;
            __executeCallbackAsync(callback, [null, buffer]);
        })
        .catch(callback);
}

function rename(fromPath, toPath, callback) {
    client
        .filesMove({
            from_path: __normalizePath(fromPath),
            to_path: __normalizePath(toPath)
        })
        .then(() => {
            __executeCallbackAsync(callback, [null]);
        })
        .catch(callback);
}

function stat(remotePath, callback) {
    client
        .filesGetMetadata({path: __normalizePath(remotePath)})
        .then(meta => {
            meta = __convertStat(meta);
            __executeCallbackAsync(callback, [null, meta]);
        })
        .catch(callback);
}

function unlink(remotePath, callback) {
    client
        .filesDelete({path: __normalizePath(remotePath)})
        .then(() => {
            __executeCallbackAsync(callback, [null]);
        })
        .catch(callback);
}

function writeFile(remotePath, data, options = {}, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    options = Object.assign({
        overwrite: true,
        encoding: 'utf8'
    }, options);

    const uploadOpts = {
        path: __normalizePath(remotePath),
        contents: (data instanceof Buffer) ? data : Buffer.from(data, options.encoding)
    };

    if (options.overwrite !== false) {
        uploadOpts.mode = {
            '.tag': 'overwrite'
        };
    }

    client
        .filesUpload(uploadOpts).then(meta => {
            meta = __convertStat(meta);
            __executeCallbackAsync(callback, [null, meta]);
        })
        .catch(callback);
}

/*
readdir('/', (err, files) => {
    console.log(files);
});*/

/*readFile('/index.js', 'utf8', (err, file) => {
    console.log(err);
    console.log(file);
});*/

/*stat('/index.js', (err, stat) => {
    console.log(stat);
});*/

/*writeFile('/sallar.txt', "sallar 222", (err, stat) => {
    console.log(err, stat);
})
*/