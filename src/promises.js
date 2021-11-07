import Dropbox from 'dropbox';
import dropboxStream from 'dropbox-stream';

const TYPE_KEY = '@@fsType';
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

    const fs = require('./index')({ apiKey, client });

    const api = {
        [TYPE_KEY]: 'dropbox-fs',

        /**
         * Read a directory and list all the files and folders inside
         *
         * @param {String} remotePath
         * @param {Object} options
         * @return {Promise<(DropboxTypes.files.FileMetadataReference | DropboxTypes.files.FolderMetadataReference | DropboxTypes.files.DeletedMetadataReference)[]>}
         */
        readdir(remotePath = '', options = {}) {
            return new Promise((resolve, reject) => {
                fs.readdir(remotePath, options, (err, entries) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(entries);
                });
            });
        },

        /**
         * Create a remote directory
         *
         * @param {String} remotePath
         * @return {Promise<DropboxTypes.files.FolderMetadata>}
         */
        mkdir(remotePath) {
            return new Promise((resolve, reject) => {
                fs.mkdir(remotePath, (err, metadata) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(metadata);
                });
            });
        },

        /**
         * Read a remote file and return it’s contents
         *
         * @param {String} remotePath
         * @param {Object} options
         * @return {Promise<Buffer>}
         */
        async readFile(remotePath, options = { encoding: null }) {
            return new Promise((resolve, reject) => {
                fs.readFile(remotePath, options, (err, buffer) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(buffer);
                });
            });
        },

        /**
         * Rename (move) a remote file
         *
         * @param {String} fromPath
         * @param {String} toPath
         * @return {Promise<void>}
         */
        rename(fromPath, toPath) {
            return new Promise((resolve, reject) => {
                fs.rename(fromPath, toPath, err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        },

        /**
         * Return file or folder meta data
         *
         * @param {String} remotePath
         * @return {Promise<DropboxTypes.files.FileMetadataReference | DropboxTypes.files.FolderMetadataReference | DropboxTypes.files.DeletedMetadataReference>}
         */
        stat(remotePath) {
            return new Promise((resolve, reject) => {
                fs.stat(remotePath, (err, meta) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(meta);
                });
            });
        },

        /**
         * Delete a file or folder
         *
         * @param {String} remotePath
         * @return {Promise<void>}
         */
        unlink(remotePath) {
            return new Promise((resolve, reject) => {
                fs.unlink(remotePath, err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
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
         * @return {Promise<DropboxTypes.files.FileMetadata>}
         */
        writeFile(remotePath, data, options = {}) {
            return new Promise((resolve, reject) => {
                fs.writeFile(remotePath, data, options, (err, meta) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(meta);
                });
            });
        }
    };

    api.rmdir = api.unlink;

    return api;
};
