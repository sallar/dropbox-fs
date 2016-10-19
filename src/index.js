const Dropbox = require("dropbox");

const dbx = new Dropbox({ accessToken: process.env.KEY });

function normalizePath(path) {
    if (path === '/') {
        return '';
    } else if (path.indexOf('./') === 0) {
        return path.replace(/\.\//, '');
    }
    return path;
}

function readdir(path, options, callback) {
    path = normalizePath(path);
    if (typeof options === 'function') {
        callback = options;
    }

    dbx
        .filesListFolder({path})
        .then(response => {
            const files = response.entries.map(entry => entry.name);
            callback(null, files);
        })
        .catch(callback);
}

readdir('/Public', {}, (err, files) => {
    console.log(err);
    console.log(files);
});