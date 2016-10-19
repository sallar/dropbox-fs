import assert from "assert";

const fs = require('../src/index')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe("fs.stat()", function() {

    this.timeout(10000);

    it("Returns correct stat for a file", (done) => {
        fs.stat('/list-test/test1.txt', (err, stat) => {
            assert.equal(err, null);
            assert.equal(typeof stat.isDirectory, 'function');
            assert.equal(stat.isDirectory(), false);
            assert.equal(stat.isFile(), true);
            assert.equal(stat.name, 'test1.txt');
            done();
        });
    });

    it("Returns correct stat for a directory", (done) => {
        fs.stat('/list-test', (err, stat) => {
            assert.equal(err, null);
            assert.equal(typeof stat.isDirectory, 'function');
            assert.equal(stat.isDirectory(), true);
            assert.equal(stat.isFile(), false);
            assert.equal(stat.name, 'list-test');
            done();
        });
    });

});
