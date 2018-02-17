import normalDropboxFS from './index';

// List of API methods that should be prevented in read-only mode
const dangerousMethods = ['mkdir', 'rename', 'rmdir', 'unlink', 'writeFile'];

/**
 * Create a read-only fs-like API for Dropbox
 *
 * @param {{
 *  apiKey: String,
 *  client: Dropbox,
 * }} Configuration object
 * @returns {Object}
 */
export default ({ client, apiKey }) => {
    const api = normalDropboxFS({ client, apiKey });

    const returnError = method => (...methodArgs) => {
        const cb = methodArgs[methodArgs.length - 1];
        cb(`${method} is not supported in read-only mode`);
    };

    // Replace dangerous methods with safe ones
    dangerousMethods.forEach(method => {
        api[method] = returnError(method);
    });

    return api;
};
