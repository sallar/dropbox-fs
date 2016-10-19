import assert from "assert";

const fs = require('../src/index')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe("fs.readFile()", function() {

    this.timeout(10000);

    it("Reads a file correctly", (done) => {
        fs.readFile('/list-test/test1.txt', (err, result) => {
            assert.equal(err, null);
            assert.ok(result instanceof Buffer);
            assert.equal(result.toString('utf8'), 'one\n');
            done();
        });
    });

    it("Reads a file correctly with options", (done) => {
        fs.readFile('/list-test/test2.txt', {
            encoding: 'base64'
        }, (err, result) => {
            assert.equal(err, null);
            assert.equal(typeof result, 'string');
            assert.equal(result, 'dHdvCg==');
            done();
        });
    });

});
