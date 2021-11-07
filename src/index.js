import Dropbox from 'dropbox';
import dropboxStream from 'dropbox-stream';

const TYPE_KEY = '@@fsType';

/**
 * Convert an object to fs-like stat object
 *
 * @param {Object} entry
 * @returns {Object}
 */
function __convertToStat(entry) {
    return {
        ...entry,
        isFile: () => entry['.tag'] === 'file',
        isDirectory: () => entry['.tag'] === 'folder'
    };
}

/**
 * Execute a callback async
 * Borrowed from: https://github.com/perry-mitchell/webdav-fs/blob/master/source/index.js#L19
 *
 * @param {Function} callback
 * @param {Array.<Any>} args
 */
function __executeCallbackAsync(callback, args) {
    if (typeof setImmediate !== 'undefined') {
        setImmediate(function() {
            callback.apply(null, args);
        });
    } else {
        setTimeout(function() {
            callback.apply(null, args);
        }, 0);
    }
}

/**
 * Normalize an input path string or buffer
 * Dropbox doesn’t allow '/' for root, it should be an empty string
 * and some users prefer to prefix the path with a dot.
 *
 * @param {String|Buffer} remotePath
 * @returns {String}
 */
function __normalizePath(remotePath) {
    if (remotePath instanceof Buffer) {
        remotePath = remotePath.toString('utf8');
    }

    if (remotePath === '/') {
        return '';
    }

    if (remotePath.indexOf('./') === 0) {
        return remotePath.replace(/\.\//, '');
    }

    return remotePath;
}

/**
 * Create an fs-like API for Dropbox
 *
 * @param {{
 *  apiKey: String,
 *  client: Dropbox
 * }} Configuration object
 * @returns {Object}
 */
export default ({ apiKey = null, client = null } = {}) => {
    if (!client && typeof apiKey === 'string') {
        client = new Dropbox({
            accessToken: apiKey
        });
    } else if (!client) {
        throw new Error('Dropbox client or apiKey should be provided.');
    }

    const api = {
        // fs adapter type (for downstream integrations)
        [TYPE_KEY]: 'dropbox-fs',

        /**
         * Read a directory and list all the files and folders inside
         *
         * @param {String} remotePath
         * @param {Object} options
         * @param {Function} callback
         */
        readdir(remotePath = '', options = {}, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = {};
            }

            const mode = options.mode || 'node';

            client
                .filesListFolder({ path: __normalizePath(remotePath) })
                .then(({ entries }) => {
                    if (mode === 'node') {
                        entries = entries.map(entry => entry.name);
                    } else if (mode === 'stat') {
                        entries = entries.map(entry => __convertToStat(entry));
                    } else {
                        return callback(new Error(`Unknown mode: ${mode}`));
                    }
                    __executeCallbackAsync(callback, [null, entries]);
                })
                .catch(callback);
        },

        /**
         * Create a remote directory
         *
         * @param {String} remotePath
         * @param {Function} callback
         */
        mkdir(remotePath, callback) {
            client
                .filesCreateFolderV2({ path: __normalizePath(remotePath) })
                .then(({ metadata }) => {
                    metadata['.tag'] = 'folder';
                    metadata = __convertToStat(metadata);
                    __executeCallbackAsync(callback, [null, metadata]);
                })
                .catch(callback);
        },

        /**
         * Read a remote file and return it’s contents
         *
         * @param {String} remotePath
         * @param {Object} options
         * @param {Function} callback
         */
        readFile(remotePath, options = { encoding: null }, callback) {
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
                .filesDownload({ path: __normalizePath(remotePath) })
                .then(resp => {
                    if (resp.fileBinary) {
                        // Probably running in node: `fileBinary` is passed
                        let buffer = Buffer.from(resp.fileBinary, 'ascii');
                        buffer = encoding ? buffer.toString(encoding) : buffer;
                        __executeCallbackAsync(callback, [null, buffer]);
                    } else {
                        // Probably browser environment: use FileReader + ArrayBuffer
                        const fileReader = new FileReader();
                        let buffer;
                        fileReader.onload = function() {
                            buffer = Buffer.from(this.result);
                            buffer = encoding
                                ? buffer.toString(encoding)
                                : buffer;
                            __executeCallbackAsync(callback, [null, buffer]);
                        };
                        fileReader.readAsArrayBuffer(resp.fileBlob);
                    }
                })
                .catch(callback);
        },

        /**
         * Rename (move) a remote file
         *
         * @param {String} fromPath
         * @param {String} toPath
         * @param {Function} callback
         */
        rename(fromPath, toPath, callback) {
            client
                .filesMoveV2({
                    from_path: __normalizePath(fromPath),
                    to_path: __normalizePath(toPath)
                })
                .then(() => {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        /**
         * Return file or folder meta data
         *
         * @param {String} remotePath
         * @param {Function} callback
         */
        stat(remotePath, callback) {
            client
                .filesGetMetadata({ path: __normalizePath(remotePath) })
                .then(meta => {
                    meta = __convertToStat(meta);
                    __executeCallbackAsync(callback, [null, meta]);
                })
                .catch(callback);
        },

        /**
         * Delete a file or folder
         *
         * @param {String} remotePath
         * @param {Function} callback
         */
        unlink(remotePath, callback) {
            client
                .filesDeleteV2({ path: __normalizePath(remotePath) })
                .then(() => {
                    __executeCallbackAsync(callback, [null]);
                })
                .catch(callback);
        },

        /**
         * create write stream
         *
         * @param {String} token
         * @param {String} remotePath
         * @returns {Stream}
         */
        createWriteStream(filepath) {
            return dropboxStream.createDropboxUploadStream({
                token: client.accessToken,
                filepath,
                chunkSize: 1000 * 1024
            });
        },

        /**
         * create read stream
         *
         * @param {String} token
         * @param {String} remotePath
         * @returns {Stream}
         */
        createReadStream(filepath) {
            return dropboxStream.createDropboxDownloadStream({
                token: client.accessToken,
                filepath
            });
        },

        /**
         * Write a file
         *
         * @param {String} remotePath
         * @param {String|Buffer} data
         * @param {Object|String} options
         * @param {Function} callback
         */
        writeFile(remotePath, data, options = {}, callback) {
            if (typeof options === 'function') {
                callback = options;
                options = {};
            } else if (typeof options === 'string') {
                options = {
                    encoding: options
                };
            }

            options = {
                overwrite: true,
                encoding: 'utf8',
                ...options
            };

            const uploadOpts = {
                path: __normalizePath(remotePath),
                contents:
                    data instanceof Buffer
                        ? data
                        : Buffer.from(data, options.encoding)
            };

            if (options.overwrite !== false) {
                uploadOpts.mode = {
                    '.tag': 'overwrite'
                };
            }

            client
                .filesUpload(uploadOpts)
                .then(meta => {
                    meta['.tag'] = 'file';
                    meta = __convertToStat(meta);
                    __executeCallbackAsync(callback, [null, meta]);
                })
                .catch(callback);
        }
    };

    api.rmdir = api.unlink;

    return api;
};
